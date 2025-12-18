'use client';
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

const CommonLayout = ({ children }) => {
  const pathname = usePathname();

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const isAuthOrAdmin = pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/signup');

  if (isAuthOrAdmin) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <AnimatePresence mode="wait">
      <div
        key={pathname}
        className="w-full min-h-screen h-auto bg-gradient-to-b from-blue-200 to-violet-200 
                   dark:bg-none dark:bg-zinc-900 overflow-x-hidden overflow-y-hidden flex flex-col"
      >
        {/* Top overlay */}
        <motion.div
          className="fixed inset-0 bg-black dark:bg-white rounded-b-[100px] z-40 pointer-events-none"
          animate={{ height: '0vh' }}
          exit={{ height: '100vh' }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
        />

        {/* Transition text */}
        <motion.div
          className="fixed m-auto w-fit h-fit top-0 bottom-0 left-0 right-0 
                     text-white dark:text-black text-3xl sm:text-4xl md:text-6xl lg:text-8xl 
                     cursor-default z-50 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {pathname.substring(1).toUpperCase()}
        </motion.div>

        {/* Bottom overlay */}
        <motion.div
          className="fixed inset-0 bg-black dark:bg-white rounded-t-[100px] bottom-0 z-30 pointer-events-none"
          initial={{ height: '100vh' }}
          animate={{
            height: '0vh',
            transition: {
              delay: 0.5,
            },
          }}
        />

        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AnimatePresence>
  );
};

export default CommonLayout;
