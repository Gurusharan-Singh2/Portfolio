"use client";
import { motion } from "framer-motion";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-white/10 dark:bg-black/30 backdrop-blur-md border-t border-violet-300/20 dark:border-violet-500/20 py-6 px-6 mt-12"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-center md:text-left text-gray-600 dark:text-gray-300">
          © {new Date().getFullYear()} Gurusharan Singh. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a
            href="https://www.linkedin.com/in/gurusharan-singh-6138b4257"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:text-white transition-all duration-200"
          >
            <FaLinkedinIn className="text-xl" />
          </a>
          <a
            href="https://github.com/Gurusharan-Singh2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:text-white transition-all duration-200"
          >
            <FaGithub className="text-xl" />
          </a>
          <a
            href="https://www.instagram.com/smarterguru"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:text-white transition-all duration-200"
          >
            <IoLogoInstagram className="text-xl" />
          </a>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
