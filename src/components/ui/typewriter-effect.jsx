"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
  typingSpeed = 150, // New prop with default value
  delayBeforeRestart = 2000, // New prop with default value
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);
  const currentIndexRef = useRef(currentIndex); // To avoid stale closures

  // Update ref when currentIndex changes
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Map every character with corresponding className and add space after each word
  const charMeta = words.flatMap((word, wordIndex) => {
    const chars = word.text.split("").map((char) => ({
      char,
      className: word.className || "",
    }));
    // Add space after each word except the last
    if (wordIndex < words.length - 1) {
      chars.push({ char: " ", className: "" });
    }
    return chars;
  });

  // Type function that handles the typing effect
  const type = () => {
    if (currentIndexRef.current < charMeta.length) {
      setCurrentIndex((prev) => prev + 1);
      timeoutRef.current = setTimeout(type, typingSpeed);
    } else {
      // Restart typing animation after a pause
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex(0); // Reset the typing
      }, delayBeforeRestart);
    }
  };

  useEffect(() => {
    type(); // Start typing when the component mounts or words change

    return () => {
      // Cleanup all timeouts on unmount or when words change
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [words]); // Restart effect if words change

  // Restart typing when currentIndex is reset to 0
  useEffect(() => {
    if (currentIndex === 0 && charMeta.length > 0) {
      type();
    }
  }, [currentIndex]);

  return (
    <div
      className={cn(
        "text-2xl md:text-3xl lg:text-5xl font-bold text-center whitespace-pre-wrap",
        className
      )}
    >
      {charMeta.slice(0, currentIndex).map((charObj, idx) => (
        <span
          key={idx}
          className={cn("dark:text-white text-black", charObj.className)}
        >
          {charObj.char}
        </span>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500 ml-1",
          cursorClassName
        )}
      />
    </div>
  );
};