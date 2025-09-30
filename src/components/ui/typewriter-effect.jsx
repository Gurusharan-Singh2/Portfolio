"use client";

import { cn } from "@/lib/utils";
// framer-motion is not used here currently
import { useEffect, useState, useRef } from "react";

export const TypewriterEffect = ({
  words,
  className,
  typingSpeed = 150,
  delayBeforeRestart = 2000,
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
    type();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [words, typingSpeed, delayBeforeRestart]);

  // Restart typing when currentIndex is reset to 0
  useEffect(() => {
    if (currentIndex === 0 && charMeta.length > 0) {
      type();
    }
  }, [currentIndex, charMeta.length, typingSpeed, delayBeforeRestart]);

  return (
    <div
      className={cn(
        "text-3xl md:text-4xl lg:text-6xl font-extrabold text-center whitespace-pre-wrap",
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
      
    </div>
  );
};