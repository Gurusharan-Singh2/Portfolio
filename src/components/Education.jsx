import { motion } from 'framer-motion';
import { FaUniversity, FaSchool, FaCalendarAlt } from 'react-icons/fa';

const EducationSection = () => {
  return (
    <motion.div 
      className="h-full flex flex-col text-center p-6 sm:p-10 lg:p-12"
      initial={{ y: "-200vh" }} 
      animate={{ y: "0" }} 
      transition={{ duration: 1 }}
    >
      <motion.h2 
        className="text-4xl font-bold mb-12 text-gray-800 dark:text-white"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Education <span className="text-purple-500">Journey</span>
      </motion.h2>

      {/* Education Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <motion.div 
          className="hidden lg:block absolute left-1/2 h-full w-1 bg-gradient-to-b from-purple-400 to-purple-600"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* First Education Item */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-gray-200 dark:bg-gray-800 rounded-xl shadow-xl p-6 lg:p-8 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-l-4 border-purple-500">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg z-10">
                <motion.span 
                  className="text-white text-xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  1
                </motion.span>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">B.Tech in Computer Science</h3>
                <div className="flex items-center justify-center text-purple-500 mb-3">
                  <FaUniversity className="mr-2" />
                  <p className="font-medium">A.K.T.U, Lucknow</p>
                </div>
                <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="mr-2" />
                  <p>Expected Completion: 2026</p>
                </div>
               
              </div>
            </div>
          </motion.div>

          {/* Second Education Item */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-gray-200 dark:bg-gray-800 rounded-xl shadow-xl p-6 lg:p-8 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-l-4 border-purple-500">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg z-10">
                <motion.span 
                  className="text-white text-xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  2
                </motion.span>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Senior Secondary (12)</h3>
                <div className="flex items-center justify-center text-purple-500 mb-3">
                  <FaSchool className="mr-2" />
                  <p className="font-medium">C.B.S.E, Lakhimpur, U.P.</p>
                </div>
                <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="mr-2" />
                  <p>Completion: 2020</p>
                </div>
               
              </div>
            </div>
          </motion.div>

          {/* Third Education Item */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-gray-200 dark:bg-gray-800 rounded-xl shadow-xl p-6 lg:p-8 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-l-4 border-purple-500">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg z-10">
                <motion.span 
                  className="text-white text-xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  3
                </motion.span>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Secondary (10)</h3>
                <div className="flex items-center justify-center text-purple-500 mb-3">
                  <FaSchool className="mr-2" />
                  <p className="font-medium">C.B.S.E, Lakhimpur, U.P.</p>
                </div>
                <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="mr-2" />
                  <p>Completion: 2018</p>
                </div>
               
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EducationSection;