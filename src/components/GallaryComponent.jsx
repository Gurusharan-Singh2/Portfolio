"use client";
import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

const GallarySection = () => {
  return (
    <div className="px-6 py-12">
      {/* Container with Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Left Image */}
        <motion.div
          className="group relative rounded-lg overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/images/left-image.jpg"
            alt="Left Image"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black opacity-50 group-hover:opacity-0 transition-all duration-300"></div>
        </motion.div>

        {/* Center Card with Hover Effect */}
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-2xl transition-all hover:scale-105 hover:shadow-3xl duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h3 className="text-3xl font-semibold text-gray-800 mb-4">
            Interactive Card
          </h3>
          <p className="text-gray-600 mb-6">
            Discover something amazing! Our interactive card scales and shows more details when hovered.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-all">
            Learn More
          </button>
        </motion.div>

        {/* Right Image */}
        <motion.div
          className="group relative rounded-lg overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/images/right-image.jpg"
            alt="Right Image"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black opacity-50 group-hover:opacity-0 transition-all duration-300"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default GallarySection;
