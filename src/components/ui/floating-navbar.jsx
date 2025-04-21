"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { usePathname } from "next/navigation";
import Link from "next/link";

export const FloatingNav = ({ navItems, className }) => {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        " hidden lg:flex max-w-fit sticky top-4  inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-4 px-6",
        className
      )}
    >
      {navItems.map((navItem, idx) => {
        const isActive = pathname === navItem.link;

        return (
          <Link
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative items-center flex space-x-1 text-sm transition-all",
              isActive
                ? "text-violet-600 font-semibold dark:text-violet-500 underline underline-offset-4"
                : "text-neutral-600 dark:text-neutral-50 hover:text-neutral-500 dark:hover:text-neutral-300"
            )}
          >
            <span >{navItem.icon}</span>
            <span className="hidden sm:block  font-bold">{navItem.name}</span>
          </Link>
        );
      })}
    </motion.div>
  );
};
