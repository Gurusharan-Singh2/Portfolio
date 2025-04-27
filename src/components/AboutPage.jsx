'use client'
import React from 'react'
import { motion } from 'framer-motion'
import EducationSection from './Education'
import TechnicalSkills from './Skills'





const AboutPageComponent = () => {
  return (
    <motion.div 
      className="h-full flex flex-col   text-center p-6"
      initial={{ y: "-200vh" }} 
      animate={{ y: "0" }} 
      transition={{ duration: 1 }}
      
    >
     

      <div className='w-full flex flex-col gap-4 lg:gap-0 lg:flex-row justify-around items-center px-5 mt-10'>
     
<motion.p
  className="text-lg max-w-3xl font-medium mb-6 text-gray-800 dark:text-white leading-relaxed"
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1 }}
>
  Hello! I'm a motivated MERN Stack Developer with a passion for building scalable web applications and beautiful, responsive user interfaces. 
  Skilled in React, Next.js, Node.js, and cloud deployment, I love turning creative ideas into real-world, impactful projects. 
  <p>Let&apos;s innovate and build something extraordinary together!</p>

</motion.p>

      <img 
        src='/p.svg' 
        alt="Cartoon about web design" 
        className="w-72 h-auto rounded-lg  dark:bg-white  hover:ring-2 hover:ring-purple-500 hover:scale-125 transition-all ease-linear duration-200"
      />
      </div>

{/* education */}

<EducationSection/>

<TechnicalSkills/>
      
    </motion.div>
  )
}

export default AboutPageComponent
