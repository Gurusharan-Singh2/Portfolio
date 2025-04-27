'use client';
import { useEffect, useRef, useMemo, useCallback } from 'react';

function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
}) {
  const canvasRef = useRef(null);
  const pointersRef = useRef([{ id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, down: false, moved: false, color: [0, 0, 0] }]);
  const configRef = useRef({
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    CAPTURE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    PAUSED: false,
    BACK_COLOR,
    TRANSPARENT,
  });
  const animationRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const colorUpdateTimerRef = useRef(0);

  // WebGL resources
  const glRef = useRef(null);
  const extRef = useRef(null);
  const dyeRef = useRef(null);
  const velocityRef = useRef(null);
  const divergenceRef = useRef(null);
  const curlRef = useRef(null);
  const pressureRef = useRef(null);
  const programsRef = useRef({});
  const displayMaterialRef = useRef(null);

  // Initialize WebGL context
  const initWebGL = useCallback((canvas) => {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };
    
    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!isWebGL2) {
      gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
    }

    let halfFloat;
    let supportLinearFiltering;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat?.HALF_FLOAT_OES;

    let formatRGBA, formatRG, formatR;
    if (isWebGL2) {
      formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
      formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    return {
      gl,
      ext: {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType,
        supportLinearFiltering,
      },
    };
  }, []);

  // Compile shader
  const compileShader = useCallback((type, source, keywords) => {
    const gl = glRef.current;
    if (!gl) return null;

    source = addKeywords(source, keywords);
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    
    return shader;
  }, []);

  // Add keywords to shader
  const addKeywords = useCallback((source, keywords) => {
    if (!keywords) return source;
    let keywordsString = '';
    keywords.forEach((keyword) => {
      keywordsString += `#define ${keyword}\n`;
    });
    return keywordsString + source;
  }, []);

  // Initialize framebuffers
  const initFramebuffers = useCallback(() => {
    const gl = glRef.current;
    const ext = extRef.current;
    const config = configRef.current;
    
    if (!gl || !ext) return;

    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);
    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    
    gl.disable(gl.BLEND);

    // Initialize or resize dye buffer
    if (!dyeRef.current) {
      dyeRef.current = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    } else {
      dyeRef.current = resizeDoubleFBO(dyeRef.current, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    }

    // Initialize or resize velocity buffer
    if (!velocityRef.current) {
      velocityRef.current = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    } else {
      velocityRef.current = resizeDoubleFBO(velocityRef.current, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    }

    // Initialize other buffers
    divergenceRef.current = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    curlRef.current = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    pressureRef.current = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
  }, []);

  // Create FBO
  const createFBO = useCallback((w, h, internalFormat, format, type, param) => {
    const gl = glRef.current;
    if (!gl) return null;

    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1.0 / w,
      texelSizeY: 1.0 / h,
      attach: (id) => {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }, []);

  // Create double FBO
// Create double FBO
const createDoubleFBO = useCallback((w, h, internalFormat, format, type, param) => {
  let fbo1 = createFBO(w, h, internalFormat, format, type, param);
  let fbo2 = createFBO(w, h, internalFormat, format, type, param);
  return {
    width: w,
    height: h,
    texelSizeX: fbo1.texelSizeX,
    texelSizeY: fbo1.texelSizeY,
    get read() {
      return fbo1;
    },
    get write() {
      return fbo2;
    },
    swap: () => {
      const temp = fbo1;
      fbo1 = fbo2;
      fbo2 = temp;
    },
  };
}, [createFBO]);

  // Initialize programs
  const initPrograms = useCallback(() => {
    const gl = glRef.current;
    if (!gl) return;

    const baseVertexShader = compileShader(
      gl.VERTEX_SHADER,
      `precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      
      void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
      }`
    );

    const displayShaderSource = `precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;
      
      vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }
      
      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;
      
              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);
      
              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);
      
              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif
      
          float a = max(c.r, max(c.g, c.b);
          gl_FragColor = vec4(c, a);
      }`;

    programsRef.current = {
      copy: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        
        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }`)),
      clear: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;
        
        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }`)),
      splat: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;
        
        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }`)),
      advection: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;
        
        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);
        
            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        
            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }
        
        void main () {
            #ifdef MANUAL_FILTERING
                vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                vec4 result = bilerp(uSource, coord, dyeTexelSize);
            #else
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
            #endif
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }`, extRef.current?.supportLinearFiltering ? null : ['MANUAL_FILTERING'])),
      divergence: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
        
        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;
        
            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }
        
            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }`)),
      curl: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
        
        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }`)),
      vorticity: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;
        
        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;
        
            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;
        
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity += force * dt;
            velocity = min(max(velocity, -1000.0), 1000.0);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }`)),
      pressure: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
        
        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }`)),
      gradientSubtract: new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;
        
        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }`)),
    };

    displayMaterialRef.current = new Material(baseVertexShader, displayShaderSource);
  }, [compileShader]);

  // Update frame
  const updateFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    const dt = calcDeltaTime();
    if (resizeCanvas()) initFramebuffers();
    updateColors(dt);
    applyInputs();
    step(dt);
    render(null);
    animationRef.current = requestAnimationFrame(updateFrame);
  }, [initFramebuffers]);

  // Initialize the effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { gl, ext } = initWebGL(canvas);
    glRef.current = gl;
    extRef.current = ext;

    initPrograms();
    initFramebuffers();
    lastUpdateTimeRef.current = Date.now();

    // Start animation loop
    animationRef.current = requestAnimationFrame(updateFrame);

    // Event listeners
    const handlePointerDown = (e) => {
      const pointer = pointersRef.current[0];
      const posX = scaleByPixelRatio(e.clientX - canvas.offsetLeft);
      const posY = scaleByPixelRatio(e.clientY - canvas.offsetTop);
      updatePointerDownData(pointer, -1, posX, posY);
      clickSplat(pointer);
    };

    const handlePointerMove = (e) => {
      const pointer = pointersRef.current[0];
      const posX = scaleByPixelRatio(e.clientX - canvas.offsetLeft);
      const posY = scaleByPixelRatio(e.clientY - canvas.offsetTop);
      updatePointerMoveData(pointer, posX, posY, pointer.color);
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
    };
  }, [initWebGL, initPrograms, initFramebuffers, updateFrame]);

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full pointer-events-none">
      <canvas 
        ref={canvasRef} 
        id="fluid" 
        className="w-screen h-screen block"
      />
    </div>
  );
}



// Helper classes and functions
class Program {
  constructor(vertexShader, fragmentShader) {
    this.uniforms = {};
    this.program = createProgram(vertexShader, fragmentShader);
    this.uniforms = getUniforms(this.program);
  }
  bind() {
    gl.useProgram(this.program);
  }
}

class Material {
  constructor(vertexShader, fragmentShaderSource) {
    this.vertexShader = vertexShader;
    this.fragmentShaderSource = fragmentShaderSource;
    this.programs = [];
    this.activeProgram = null;
    this.uniforms = [];
  }
  setKeywords(keywords) {
    let hash = 0;
    for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);
    let program = this.programs[hash];
    if (program == null) {
      let fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
      program = createProgram(this.vertexShader, fragmentShader);
      this.programs[hash] = program;
    }
    if (program === this.activeProgram) return;
    this.uniforms = getUniforms(program);
    this.activeProgram = program;
  }
  bind() {
    gl.useProgram(this.activeProgram);
  }
}
// Add these helper functions before the export statement

function createProgram(vertexShader, fragmentShader) {
  const gl = glRef.current;
  if (!gl) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  
  return program;
}

function getUniforms(program) {
  const gl = glRef.current;
  if (!gl) return {};

  const uniforms = {};
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  
  for (let i = 0; i < uniformCount; i++) {
    const uniformName = gl.getActiveUniform(program, i).name;
    uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
  }
  
  return uniforms;
}

function blit(target, clear = false) {
  const gl = glRef.current;
  if (!gl) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
    gl.STATIC_DRAW
  );
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array([0, 1, 2, 0, 2, 3]),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  if (target == null) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  } else {
    gl.viewport(0, 0, target.width, target.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
  }

  if (clear) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

// Add these helper functions as well

function resizeFBO(target, w, h, internalFormat, format, type, param) {
  const newFBO = createFBO(w, h, internalFormat, format, type, param);
  const copyProgram = programsRef.current.copy;
  
  copyProgram.bind();
  gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
  blit(newFBO);
  
  return newFBO;
}

function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
  if (target.width === w && target.height === h) return target;
  
  target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
  target.write = createFBO(w, h, internalFormat, format, type, param);
  target.width = w;
  target.height = h;
  target.texelSizeX = 1.0 / w;
  target.texelSizeY = 1.0 / h;
  
  return target;
}

function getSupportedFormat(gl, internalFormat, format, type) {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    switch (internalFormat) {
      case gl.R16F:
        return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
      case gl.RG16F:
        return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      default:
        return null;
    }
  }
  return { internalFormat, format };
}

function supportRenderTextureFormat(gl, internalFormat, format, type) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
  
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  return status === gl.FRAMEBUFFER_COMPLETE;
}

function getResolution(resolution) {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
  const min = Math.round(resolution);
  const max = Math.round(resolution * aspectRatio);
  return gl.drawingBufferWidth > gl.drawingBufferHeight 
    ? { width: max, height: min } 
    : { width: min, height: max };
}

function scaleByPixelRatio(input) {
  const pixelRatio = window.devicePixelRatio || 1;
  return Math.floor(input * pixelRatio);
}

function hashCode(s) {
  if (s.length === 0) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function HSVtoRGB(h, s, v) {
  let r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  
  return { r, g, b };
}

function wrap(value, min, max) {
  const range = max - min;
  if (range === 0) return min;
  return ((value - min) % range) + min;
}




export default SplashCursor;