"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaLockOpen, FaCopy, FaRedo, FaDownload, FaPalette } from "react-icons/fa";

const ColorGenerator = () => {
  const [colors, setColors] = useState([]);
  const [format, setFormat] = useState("hex"); 
  const [toasts, setToasts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState("solid"); 


  useEffect(() => {
    setColors(generateInitialColors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);


  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [mode]);

 
  // Generate harmonious colors using color theory
  const generateRandomRGB = () => {
    // Generate vivid, saturated colors (avoid muddy grays)
    const h = Math.random() * 360;
    const s = 60 + Math.random() * 40; // 60-100% saturation
    const l = 45 + Math.random() * 25; // 45-70% lightness
    return hslToRgb(h, s, l);
  };

  // HSL to RGB conversion
  const hslToRgb = (h, s, l) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  const rgbToHex = ({ r, g, b }) =>
    `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`.toUpperCase();

  
  const rgbToHsl = ({ r, g, b }) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
        case g: h = ((b - r) / d + 2); break;
        case b: h = ((r - g) / d + 4); break;
        default: h = 0;
      }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };


  const rgbToString = (rgb) => {
    switch (format) {
      case "hex":
        return rgbToHex(rgb);
      case "rgb":
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case "hsl":
        const hsl = rgbToHsl(rgb);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      default:
        return rgbToHex(rgb);
    }
  };

  
  const generateInitialColors = () => {
    if (mode === "solid") {
      return Array.from({ length: 6 }, () => ({ rgb: generateRandomRGB(), locked: false }));
    } else {
      return Array.from({ length: 6 }, () => ({
        gradient: Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => generateRandomRGB()),
        locked: false
      }));
    }
  };


  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setColors(prevColors =>
      prevColors.map(color => {
        if (color.locked) return color;
        if (mode === "solid") return { ...color, rgb: generateRandomRGB() };
        return { ...color, gradient: Array.from({ length: color.gradient.length }, () => generateRandomRGB()) };
      })
    );
    setTimeout(() => setIsGenerating(false), 300);
  }, [mode]);

  
  const toggleLock = (index) => {
    setColors(prevColors => prevColors.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
  };

 
  const copyColor = (colorObj) => {
    let str;
    if (mode === "solid") {
      str = rgbToString(colorObj.rgb);
    } else {
      str = `linear-gradient(to right, ${colorObj.gradient?.map(rgbToString).join(", ") || "#000, #000"})`;
    }
    navigator.clipboard.writeText(str);
    showToast(mode === "solid" ? `Copied: ${str}` : "Gradient copied!");
  };

 
  const exportPalette = () => {
    const palette = mode === "solid"
      ? colors.map(c => rgbToString(c.rgb))
      : colors.map(c => `linear-gradient(to right, ${c.gradient?.map(rgbToString).join(", ")})`);
    
    const data = {
      mode,
      format,
      colors: palette,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `palette-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Palette exported!");
  };

  // Show toast notification
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <FaPalette className="text-6xl text-purple-600 dark:text-purple-400" />
            </motion.div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Color Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Generate stunning {mode} color palettes instantly
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-300 dark:border-gray-600 font-mono">Space</kbd> to generate
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-8"
        >
          {/* Mode Selector */}
          <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
            {["solid", "gradient"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  mode === m
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Format Selector */}
          <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
            {["hex", "rgb", "hsl"].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  format === fmt
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Generate Button */}
          <motion.button
            onClick={handleGenerate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
              isGenerating ? "opacity-75" : ""
            }`}
          >
            <FaRedo className={isGenerating ? "animate-spin" : ""} />
            Generate
          </motion.button>

          {/* Export Button */}
          <motion.button
            onClick={exportPalette}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 border border-gray-200 dark:border-gray-700"
          >
            <FaDownload />
            Export
          </motion.button>
        </motion.div>

        {/* Color Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {colors.map((colorObj, index) => {
            // Determine if background is dark (for solid colors only)
            const isDark = mode === "solid"
              ? (colorObj.rgb.r * 299 + colorObj.rgb.g * 587 + colorObj.rgb.b * 114) / 1000 < 128
              : true; // Always use white text for gradients

            // Background style
            const bgStyle = mode === "solid"
              ? { backgroundColor: `rgb(${colorObj.rgb.r}, ${colorObj.rgb.g}, ${colorObj.rgb.b})` }
              : { background: `linear-gradient(to right, ${colorObj.gradient?.map(rgb => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`).join(", ") || "#000, #000"})` };

            // Display label
            const displayLabel = mode === "solid"
              ? rgbToString(colorObj.rgb)
              : `${colorObj.gradient?.length || 0} colors`;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div
                  className="relative h-64 rounded-3xl shadow-2xl overflow-hidden cursor-pointer backdrop-blur-sm border-4 border-white dark:border-gray-800 transition-all duration-300"
                  style={bgStyle}
                  onClick={() => copyColor(colorObj)}
                >
                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Lock Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(index);
                    }}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
                      colorObj.locked
                        ? "bg-white/95 dark:bg-gray-900/95 text-purple-600"
                        : "bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {colorObj.locked ? <FaLock /> : <FaLockOpen />}
                  </motion.button>

                  {/* Color Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-mono text-lg font-bold mb-2 text-white truncate"
                    >
                      {displayLabel}
                    </motion.div>
                    {mode === "gradient" && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {colorObj.gradient?.map((rgb, i) => (
                          <span key={i} className="text-xs font-mono text-white/90 bg-black/30 px-2 py-1 rounded">
                            {rgbToString(rgb)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <FaCopy className="opacity-70" />
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to copy
                      </span>
                    </div>
                  </div>

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-wrap gap-4 justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <FaCopy className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm">Click to copy</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <FaLock className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm">Lock favorites</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <FaRedo className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm">Generate new</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <FaDownload className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm">Export palette</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map((toast, i) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-4 px-6 py-3 rounded-full shadow-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium flex items-center gap-2 max-w-md"
            style={{ top: 80 + i * 60 }}
          >
            <FaCopy className="text-green-400 dark:text-green-600 flex-shrink-0" />
            <span className="truncate">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ColorGenerator;
