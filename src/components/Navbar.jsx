"use client";
import { motion, stagger } from "framer-motion";
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

  const topVariants={
    closed:{
      rotate:0,
    },
    opened:{
      rotate:45,
      backgroundColor:"rgb(255,255,255)",
    }
  }
  const centerVariants={
    closed:{
      opacity:1
    },
    opened:{
      opacity:0
    }
  }
  const bottomVariants={
    closed:{
      rotate:0,
    },
    opened:{
      rotate:-45,
      backgroundColor:"rgb(255,255,255)",
    }
  }

  const listVariants={
    closed:{
      x:"100vw"
    },
    opened:{
      x:0,
      transition:{
        when:"beforeChildren",
        staggerChildren:0.2
      }
    }
  }
  const listItemVariants={
    closed:{
      x:-10,
      opacity:0
    },
    opened:{
      x:0,
      opacity:1
    }
  }



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
      name: "Gallary",
      link: "/gallary",
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
        <div className="flex lg:w-full gap-6 lg:gap-3 ">
        <FloatingNav navItems={navItems} />
        <Switch />
        <div className="block md:hidden">
          <button
            className="w-10 h-8 flex flex-col justify-between z-50 relative transition-all ease-linear duration-300"
            onClick={() => setOpen(!open)}
          >
            
            
                <motion.div variants={topVariants} animate={open?"opened":"closed"} className="w-10 h-1 bg-black dark:bg-white rounded origin-left"></motion.div>
                <motion.div variants={centerVariants} animate={open?"opened":"closed"}  className="w-10 h-1 bg-black dark:bg-white rounded"></motion.div>
                <motion.div variants={bottomVariants} animate={open?"opened":"closed"}  className="w-10 h-1 bg-black dark:bg-white rounded origin-left"></motion.div>
            
         
          </button>

          {/* Mobile Menu Overlay */}
          {open && (
            <motion.div variants={listVariants} initial="closed"  animate="opened" className="absolute top-0 left-0 w-screen h-screen bg-black text-white flex flex-col items-center justify-center gap-8 text-4xl">
              {navItems.map((item, i) => (
                <motion.div variants={listItemVariants}    key={i}>

               
                <Link href={item.link} >

                <button onClick={()=>setOpen(false)}>{item.name}</button>  
                </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
        </div>
        

        
      
      </div>
    </motion.div>
  );
};

export default Navbar;
