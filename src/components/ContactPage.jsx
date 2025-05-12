'use client'
import React from 'react'
import {motion} from 'framer-motion'
import UnderDevelopment from './UnderDevelopment'


const ContactPageComponent = () => {
  return (
    <motion.div className="h-full" initial={{y:"-200vh"}} animate={{y:"0"}} transition={{duration:1}}><UnderDevelopment/></motion.div>
  )
}

export default ContactPageComponent