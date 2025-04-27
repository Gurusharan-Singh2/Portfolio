"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  "💻 Code is like humor. When you have to explain it, it’s bad.",
  "🚀 Make it work, make it right, make it fast.",
  "🧠 First, solve the problem. Then, write the code.",
  "🎯 Programs must be written for people to read.",
  "🛠️ Good programmers write code that humans can understand.",
  // ...add your other quotes here
];

const QuoteRotator = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center px-4 mt-16 pb-5">
      <div className="w-full max-w-2xl rounded-2xl p-6 bg-white/20 dark:bg-black/30 backdrop-blur-md border border-violet-300/20 dark:border-violet-500/20 shadow-lg dark:shadow-violet-900 transition-all duration-500">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            className="text-center text-base sm:text-lg md:text-xl italic font-medium text-violet-600 dark:text-violet-400 drop-shadow-glow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.7 }}
          >
            {quotes[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuoteRotator;
