"use client";
import React from "react";
import { motion } from "framer-motion"; // fixed import
import { LampContainer } from "./ui/lamp";

export function PortfolioShowcase() {
  return (
    <div className="w-full h-screen bg-black text-white flex items-center justify-center overflow-hidden">
      <LampContainer>
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="bg-gradient-to-br from-violet-300 to-violet-600 py-4 bg-clip-text text-transparent text-center text-4xl font-bold tracking-tight md:text-7xl"
        >
          Explore My <br /> Featured Projects
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6,
            duration: 0.7,
            ease: "easeOut",
          }}
          className="mt-6 text-center text-base md:text-xl max-w-xl mx-auto text-slate-400"
        >
          A curated selection of web applications I’ve designed and developed — focused on performance, responsiveness, and creativity.
        </motion.p>
      </LampContainer>
    </div>
  );
}
