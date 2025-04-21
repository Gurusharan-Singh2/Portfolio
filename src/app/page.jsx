"use client"
import Text from "@/components/Text";
import { motion, reverseEasing } from "framer-motion";

const Homepage = () => {
  return (
    <div className="-mt-8 min-h-screen flex flex-col lg:flex-row items-center px-8 md:px-12 lg:px-20 xl:px-48 py-12 gap-2 lg:gap-16">
 
      {/* Image Section */}
      <motion.div   initial={{ x: -100, opacity: 0 }} // Start from left
      animate={{ x: 0, opacity: 1 }} // Move to center
      transition={{ duration: 2, ease: 'easeOut' }}  className="relative w-[300px] h-[300px] lg:w-[400px] lg:h-[400px]">
 
  <motion.div
  
  initial={{ borderRadius: '50%' }}  
  animate={{
    borderRadius: ['50%', '0%'],  
  }}
  transition={{
    repeat: Infinity,  
    ease: 'linear',
    duration: 8,  
    repeatType: 'reverse',  
  }}
  className="absolute inset-0 z-10 flex justify-center items-center overflow-hidden border-4 border-violet-500 bg-violet-500 shadow-lg"
>
<div className="absolute inset-0 flex justify-center items-center z-20">
    <img
      src="/H.png"
      alt="Logo"
      className="object-cover w-full h-full p-6"
    />
  </div>
</motion.div>




 
</motion.div>








      {/* Text Section */}
      <div className=" lg:w-1/2 ">

        {/* <h1 className="text-4xl md:text-6xl font-bold">Your Concept, My Creative Execution</h1> */}
        <Text/>
      </div>
    </div>
  );
};

export default Homepage;
