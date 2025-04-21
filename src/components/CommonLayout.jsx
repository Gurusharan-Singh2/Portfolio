'use client';
import React, { useEffect } from 'react';
import Navbar from './Navbar';



const CommonLayout = ({ children }) => {
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="w-screen min-h-screen h-auto bg-gradient-to-b from-blue-200 to-violet-200 dark:bg-none dark:bg-zinc-950">
      <Navbar />
     
      {children}
    </div>
  );
};

export default CommonLayout;
