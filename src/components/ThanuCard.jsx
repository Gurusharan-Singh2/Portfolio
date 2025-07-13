'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'react-lottie-player';
import successAnimation from '../../public/lottie/b.json'; // ✅ Make sure this path is valid

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: 'easeOut' },
  },
});

const ThankYouCard = ({ setStep }) => {
  const [animationLoaded, setAnimationLoaded] = useState(false);

  useEffect(() => {
    setAnimationLoaded(false);
    const timer = setTimeout(() => setAnimationLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="w-full max-w-md mx-auto bg-gradient-to-br from-white via-gray-50 to-violet-100 dark:from-gray-900 dark:via-gray-800 dark:to-violet-900 border dark:border-violet-700 border-violet-200 shadow-2xl rounded-3xl px-6 sm:px-8 py-10 text-center space-y-6 transition-colors duration-300"
      initial="initial"
      animate="animate"
    >
      {animationLoaded && (
        <motion.div {...fadeIn(0)} className="flex justify-center">
          <Lottie
            loop
            play
            animationData={successAnimation}
            style={{ width: 160, height: 160 }}
          />
        </motion.div>
      )}

      <div>
        <motion.h2
          className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white"
          {...fadeIn(0.15)}
        >
          ✅ Thank You!
        </motion.h2>

        <motion.p
          className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mt-2"
          {...fadeIn(0.25)}
        >
          Your message has been received. I’ll get back to you shortly.
        </motion.p>

        <motion.button
          onClick={() => setStep(false)}
          className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
          {...fadeIn(0.35)}
        >
          🔁 Send Another Message
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ThankYouCard;
