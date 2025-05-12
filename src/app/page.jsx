"use client";
import Text from "@/components/Text";
import { motion } from "framer-motion";
import { CiSaveDown2 } from "react-icons/ci";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { useRef } from "react";
import QuoteRotator from "@/components/QuteGenerator";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { ease: "easeOut", duration: 0.4 } },
};

const Homepage = () => {
  const ref = useRef(null);

  return (
    <motion.div 
      className="h-full overflow-hidden" 
      initial={{ y: "-200vh" }} 
      animate={{ y: "0" }} 
      transition={{ duration: 1 }}
    >
      <div className="-mt-8 min-h-[95vh] lg:min-h-screen flex flex-col lg:flex-row items-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-48 py-12 gap-10 lg:gap-14">
        {/* Image Section */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="lg:w-1/2 flex justify-center items-center mt-10"
        >
          <motion.div
            initial={{ borderRadius: "50%" }}
            animate={{
              borderRadius: ["50%", "0%"],
            }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 8,
              repeatType: "reverse",
            }}
            className="inset-0 z-10 flex justify-center items-center overflow-hidden border-4 border-violet-500 bg-violet-500 shadow-lg relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[450px] lg:h-[450px]"
          >
            <div className="absolute inset-0 flex justify-center z-20">
              <img
                src="/C.webp"
                alt="Logo"
                className="object-contain w-full h-full"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Text Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="lg:w-1/2 flex flex-col gap-14 lg:gap-4 px-10 lg:px-0"
        >
          <motion.div variants={item}>
            <Text />
          </motion.div>
          <motion.p variants={item} className="md:text-lg text-gray-700 dark:text-gray-300">
          I transform ideas into interactive digital experiences, blending clean code with creative design. Specializing in frontend and backend technologies, I create seamless, user-friendly applications that solve real problems and inspire users.
          </motion.p>
          <motion.div variants={item} className="flex gap-4">
            <Link href='/portfolio'>
            
            <button className="px-4 py-2 rounded ring-1 ring-black bg-black dark:bg-white text-white dark:text-black hover:bg-violet-500 hover:ring-violet-500 hover:text-black hover:scale-110 transition-all ease-linear duration-200 hover:font-bold">
              View My Work
            </button>
            </Link>
            <Link href='/contact'>
          
            <button className="px-4 py-2 rounded ring-1 ring-black dark:ring-white hover:bg-black hover:text-white hover:font-semibold hover:scale-110 transition-all ease-linear duration-200 dark:hover:bg-violet-500 dark:hover:ring-violet-500">
              Contact Me
            </button>
              </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Buttons Section */}
      <div ref={ref} className="w-full h-auto flex flex-col lg:flex-row justify-between items-center mt-2 lg:mt-8 pb-10 overflow-x-hidden ">
        <motion.div
            className="w-full h-[120px] lg:w-[50%] flex justify-center items-center mb-6 lg:mb-0 "
            initial={{ x: -200, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4}}
            viewport={{ once: false, amount: 0.3 }}
        >
          <a href="https://nodejsbucket2222.s3.ap-south-1.amazonaws.com/Resume.pdf" target="_blank" 
  rel="noopener noreferrer" >
          <button className="border-2 text-lg font-semibold bg-zinc-950 dark:bg-white text-slate-100 dark:text-black hover:bg-violet-500 hover:ring-1 hover:scale-125 transition-all ease-out duration-200 hover:text-black ring-purple-500 px-6 py-3 rounded-full flex items-center">
            Download CV <CiSaveDown2 className="text-xl ml-2" />
          </button>
          </a>
        </motion.div>

        <motion.div
           className="w-full lg:w-[50%] flex justify-end "
           initial={{ x: 200, opacity: 0 }}
           whileInView={{ x: 0, opacity: 1 }}
           transition={{ duration: 0.4 }}
           viewport={{ once: false, amount: 0.3}}
        >
          <div className="w-full flex gap-6 justify-center ">
            <a
              href="https://www.linkedin.com/in/gurusharan-singh-6138b4257?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="border-2 border-violet-600 px-3 py-2 rounded-full hover:bg-violet-600 text-violet-600 text-2xl hover:text-white transition-all duration-200 ease-linear">
                <FaLinkedinIn />
              </div>
            </a>
            <a
              href="https://github.com/Gurusharan-Singh2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="border-2 border-violet-600 px-3 py-2 rounded-full hover:bg-violet-600 text-violet-600 text-2xl hover:text-white transition-all duration-200 ease-linear">
                <FaGithub />
              </div>
            </a>
            <a
              href="https://www.instagram.com/smarterguru?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="border-2 border-violet-600 px-3 py-2 rounded-full hover:bg-violet-600 text-violet-600 text-2xl hover:text-white transition-all duration-200 ease-linear">
                <IoLogoInstagram />
              </div>
            </a>
          </div>
        </motion.div>
        
      </div>
      <QuoteRotator/>
    </motion.div>
  );
};

export default Homepage;