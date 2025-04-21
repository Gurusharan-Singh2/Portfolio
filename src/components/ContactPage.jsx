'use client'
import React from 'react'
import {motion} from 'framer-motion'


const ContactPageComponent = () => {
  return (
    <motion.div className="h-full" initial={{y:"-200vh"}} animate={{y:"0"}} transition={{duration:1}}>ContactPage</motion.div>
  )
}

export default ContactPageComponent