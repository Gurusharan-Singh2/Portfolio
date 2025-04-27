'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import createGlobe from 'three-globe';
import { Canvas, useFrame } from '@react-three/fiber';

function GlobeScene({ data, globeConfig }) {
  const groupRef = useRef();

  useEffect(() => {
    const globe = createGlobe()
      .arcsData(data || [])
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashAnimateTime(1000);

    if (globeConfig) {
      Object.entries(globeConfig).forEach(([key, value]) => {
        if (typeof globe[key] === 'function') {
          globe[key](value);
        }
      });
    }

    groupRef.current.clear(); // clear previous globe if hot reloading
    groupRef.current.add(globe); // just add the raw object

  }, [data, globeConfig]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return <group ref={groupRef} />;
}

export function World({ data, globeConfig }) {
  return (
    <Canvas camera={{ position: [0, 0, 500], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} />
      <GlobeScene data={data} globeConfig={globeConfig} />
    </Canvas>
  );
}
