'use client';
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { AnimatePresence,motion } from 'framer-motion';
import { usePathname } from 'next/navigation';



const CommonLayout = ({ children }) => {
  const pathname=usePathname();
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AnimatePresence mode='wait'>

    
    <div key={pathname} className="w-screen min-h-screen h-auto bg-gradient-to-b from-blue-200 to-violet-200 dark:bg-none dark:bg-zinc-900">
      <motion.div className='h-screen w-screen fixed bg-black rounded-b-[100px] z-40'
      animate={{height:"0vh"}} 
      exit={{
        height:"140vh"
      }}
      transition={{
        duration:0.5,
        ease:"easeOut"
      }}/>
      <motion.div className='fixed m-auto w-fit h-fit top-0 bottom-0 left-0 right-0 text-white text-8xl cursor-default z-50'
      initial={{opacity:1}}
      animate={{opacity:0}}
      transition={{duration:0.8, ease:"easeOut"}}>
     
    {pathname.substring(1).toUpperCase()}

      </motion.div>
      <motion.div className='h-screen w-screen fixed bg-black rounded-t-[100px] bottom-0 z-30'
      initial={{height:"140vh"}}
      animate={{
        height:"0vh",
        transition:{
          delay:0.5
        }
      }}
        />
      
      <Navbar />
     
      {children}
    </div>
    </AnimatePresence>
  );
};

export default CommonLayout;
