"use client";
import Text from "@/components/Text";
import { motion} from "framer-motion";
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
  return (
    <motion.div className="h-full" initial={{y:"-200vh"}} animate={{y:"0"}} transition={{duration:1}}>


   
    <div className="-mt-8 min-h-screen flex flex-col lg:flex-row items-center  px-8 md:px-12 lg:px-20 xl:px-48 py-12 gap-10 lg:gap-14">
      {/* Image Section */}
      <motion.div
        initial={{ x: -100, opacity: 0 }} // Start from left
        animate={{ x: 0, opacity: 1 }} // Move to center
        transition={{ duration: 2, ease: "easeOut" }}
        className="lg:w-1/2 flex justify-center items-center my-10"
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
          className=" inset-0 z-10 flex justify-center items-center overflow-hidden border-4 border-violet-500 bg-violet-500 shadow-lg relative w-[350px] h-[350px] lg:w-[450px] lg:h-[450px]"
        >
          <div className="absolute inset-0 flex justify-center  z-20">
            <img
              src="/C.webp"
              alt="Logo"
              className="object-contain w-full h-full "
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Text Section */}
      <motion.div
  variants={container}
  initial="hidden"
  animate="visible"
  className="lg:w-1/2 flex flex-col gap-2 lg:gap-4"
>
  <motion.div variants={item}>
    <Text />
  </motion.div>
  <motion.p variants={item} className="md:text-lg text-gray-700 dark:text-gray-300">
    Clean code, creative vision, and meaningful experiences — welcome to the place where I turn concepts into interactive realities. 
  </motion.p>
  <motion.div variants={item} className="flex gap-4">
    <button className="px-4 py-2 rounded ring-1 ring-black bg-black dark:bg-white  text-white dark:text-black hover:bg-violet-500 hover:ring-violet-500 hover:text-black hover:scale-110 transition-all ease-linear duration-200 hover:font-bold">View My Work</button>
    <button className="px-4 py-2 rounded ring-1 ring-black dark:ring-white  hover:bg-black hover:text-white hover:font-semibold hover:scale-110 transition-all ease-linear duration-200 dark:hover:bg-violet-500 dark:hover:ring-violet-500">Contact Me</button>
  </motion.div>
</motion.div>

    </div>

    </motion.div>
  );
};

export default Homepage;
