"use client";
import { motion } from "framer-motion";
import React, { useState } from "react";
import Link from "next/link";
import Switch from "@/utils/Switch";

import Store from "@/store/store";

// React Icons
import { FaHome, FaUserAlt, FaEnvelope, FaBriefcase } from "react-icons/fa";
import { FloatingNav } from "./ui/floating-navbar";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = Store();

  // Floating nav items using react-icons
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <FaHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "About",
      link: "/about",
      icon: <FaUserAlt className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Portfolio",
      link: "/portfolio",
      icon: <FaBriefcase className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Contact",
      link: "/contact",
      icon: <FaEnvelope className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];

  return (
    < motion.div  initial={{ opacity: 0, y: -100 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
     className="relative z-50 w-full ">
      {/* Floating Nav */}
    

      {/* Main Navbar */}
      <div className=" h-20 flex items-center justify-between px-8 md:px-12 lg:px-20 xl:px-48">
        {/* Logo */}
        <div className="">
          <Link href="/" className="text-sm bg-violet-600 rounded-md p-1 font-semibold flex items-center justify-center">
          <span className="text-white mr-1">Gurusharan</span>
          <span className="w-12 h-8 rounded bg-white text-black flex items-center justify-center">Singh</span>
          </Link>
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className="flex lg:w-full justify-between ">
        <FloatingNav navItems={navItems} />
        <Switch />
        <div className="block md:hidden">
          <button
            className="w-10 h-8 flex flex-col justify-between z-50 relative transition-all ease-linear duration-300"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <>
                <div className="absolute w-10 h-1 bg-white rounded rotate-45 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute w-10 h-1 bg-white rounded -rotate-45 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </>
            ) : (
              <>
                <div className="w-10 h-1 bg-black dark:bg-white rounded"></div>
                <div className="w-10 h-1 bg-black dark:bg-white rounded"></div>
                <div className="w-10 h-1 bg-black dark:bg-white rounded"></div>
              </>
            )}
          </button>

          {/* Mobile Menu Overlay */}
          {open && (
            <div className="absolute top-0 left-0 w-screen h-screen bg-black text-white flex flex-col items-center justify-center gap-8 text-4xl">
              {navItems.map((item, i) => (
                <Link href={item.link} key={i}>
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        </div>
        

        
      
      </div>
    </motion.div>
  );
};

export default Navbar;
