"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaTv, FaPalette, FaTools } from "react-icons/fa";

const features = [
  {
    name: "Live Tv Player",
    desc: "Watch live TV channels from around the world with our built-in player.",
    icon: <FaTv className="text-4xl" />,
    href: "/features/iptv",
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Color Generator",
    desc: "Generate stunning color palettes for your next design project instantly.",
    icon: <FaPalette className="text-4xl" />,
    href: "/color-generator",
    color: "from-pink-500 to-rose-600",
  },
  {
    name: "More Tools",
    desc: "We are building more amazing tools to help you create better projects.",
    icon: <FaTools className="text-4xl" />,
    href: "#",
    disabled: true,
    color: "from-gray-400 to-gray-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { scale: 1.05, y: -5, transition: { duration: 0.2, ease: "easeInOut" } },
};

const AllFeatures = () => {
  return (
    <section className="py-20 px-4 sm:px-8 md:px-12 lg:px-20 xl:px-48 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-gray-100">
          Explore My <span className="text-violet-600">Digital Toolkit</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          A collection of powerful tools and features I've built to showcase technical capabilities and provide utility.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={!feature.disabled ? "hover" : ""}
            className="relative group h-full"
          >
            <Link
              href={feature.disabled ? "#" : feature.href}
              className={`block h-full p-8 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 shadow-xl hover:shadow-2xl dark:hover:shadow-violet-500/20 dark:hover:border-violet-500/50 transition-all duration-300 overflow-hidden ${
                feature.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              {/* Background Gradient Blur */}
              <div
                className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 dark:opacity-20 blur-3xl group-hover:opacity-30 dark:group-hover:opacity-25 transition-opacity`}
              />

              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-black/20 dark:shadow-violet-900/30`}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-3 text-black dark:text-gray-100 group-hover:text-violet-600 transition-colors">
                {feature.name}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {feature.desc}
              </p>

              {/* CTA / Coming Soon */}
              {!feature.disabled ? (
                <div className="flex items-center text-violet-600 dark:text-violet-400 font-semibold group/btn">
                  Launch Feature
                  <svg
                    className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              ) : (
                <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Coming Soon
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default AllFeatures;
