"use client";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Switch from "@/utils/Switch";
import { FaHome, FaUserAlt, FaEnvelope, FaBriefcase, FaUserShield } from "react-icons/fa";
import { FloatingNav } from "./ui/floating-navbar";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setIsAdmin(payload?.isAdmin);
        } catch (e) {
          console.error("Invalid token", e);
        }
      }
    }
  }, []);

  const topVariants = { closed: { rotate: 0 }, opened: { rotate: 45, backgroundColor: "rgb(255,255,255)" } };
  const centerVariants = { closed: { opacity: 1 }, opened: { opacity: 0 } };
  const bottomVariants = { closed: { rotate: 0 }, opened: { rotate: -45, backgroundColor: "rgb(255,255,255)" } };
  const listVariants = { closed: { x: "100vw" }, opened: { x: 0, transition: { when: "beforeChildren", staggerChildren: 0.1 } } };
  const listItemVariants = { closed: { x: -10, opacity: 0 }, opened: { x: 0, opacity: 1 } };

  const allNavItems = [
    { name: "Home", link: "/", icon: <FaHome className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "About", link: "/about", icon: <FaUserAlt className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "Portfolio", link: "/portfolio", icon: <FaBriefcase className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "Gallary", link: "/gallary", icon: <FaBriefcase className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "Contact", link: "/contact", icon: <FaEnvelope className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "Chat", link: "/chat", icon: <FaEnvelope className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "Admin", link: "/admin", icon: <FaUserShield className="h-4 w-4 text-neutral-500 dark:text-white" />, adminOnly: true },
  ];

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <motion.div initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-50 w-full">
      <div className="h-20 flex items-center justify-between px-8 md:px-12 lg:px-20 xl:px-48">
        <div>
          <Link href="/" className="text-sm bg-violet-600 rounded-md p-1 font-semibold flex items-center justify-center">
            <span className="text-white mr-1">Gurusharan</span>
            <span className="w-12 h-8 rounded bg-white text-black flex items-center justify-center">Singh</span>
          </Link>
        </div>
        <div className="flex lg:w-full gap-6 lg:gap-3">
          <FloatingNav navItems={navItems} />
          <Switch />
          <button
            onClick={() => {
              try {
                localStorage.removeItem("token");
              } catch { /* intentionally empty: logout may fail */ }
              router.push("/login");
            }}
            className="hidden md:inline-flex px-3 py-2 rounded-md text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition"
          >
            Logout
          </button>
          <div className="block md:hidden relative">
            <button className="w-10 h-8 flex flex-col justify-between z-50 relative transition-all ease-linear duration-300" onClick={() => setOpen(!open)}>
              <motion.div variants={topVariants} animate={open ? "opened" : "closed"} className="w-10 h-1 bg-black dark:bg-white rounded origin-left"></motion.div>
              <motion.div variants={centerVariants} animate={open ? "opened" : "closed"} className="w-10 h-1 bg-black dark:bg-white rounded"></motion.div>
              <motion.div variants={bottomVariants} animate={open ? "opened" : "closed"} className="w-10 h-1 bg-black dark:bg-white rounded origin-left"></motion.div>
            </button>
            <motion.div
              key={navItems.length}
              variants={listVariants}
              initial="closed"
              animate={open ? "opened" : "closed"}
              className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center gap-8 text-4xl z-50"
              style={{paddingBottom: '80px'}}
            >
              {navItems.map((item, i) => (
                <motion.div variants={listItemVariants} key={i}>
                  <Link href={item.link}>
                    <button onClick={() => setOpen(false)}>{item.name}</button>
                  </Link>
                </motion.div>
              ))}
              <div className="absolute bottom-10 left-0 w-full flex justify-center">
                <motion.div variants={listItemVariants}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      try {
                        localStorage.removeItem("token");
                      } catch { /* intentionally empty: logout may fail */ }
                      router.push("/login");
                    }}
                    className="px-8 py-3 rounded-md text-lg font-bold bg-violet-600 text-white hover:bg-violet-700 transition flex items-center gap-2 shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l-3-3m3 3H9" />
                    </svg>
                    Logout
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
