'use client'
import React from 'react'
import {motion} from 'framer-motion'


const PortfolioPageComponent = () => {
  return (
    <motion.div className="h-full" initial={{y:"-200vh"}} animate={{y:"0"}} transition={{duration:1}}>PortfolioPage</motion.div>
  )
}

export default PortfolioPageComponent