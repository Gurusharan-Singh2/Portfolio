'use client';
import { motion } from 'framer-motion';
import { Wrench, HardHat } from 'lucide-react';

export default function UnderDevelopment() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 10 }}
        className="flex items-center justify-center bg-yellow-100 p-8 rounded-2xl shadow-lg"
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{
            repeat: Infinity,
            repeatType: 'mirror',
            duration: 1.2,
          }}
          className="mr-4"
        >
          <HardHat size={60} className="text-yellow-600" />
        </motion.div>

        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Page Under Development</h1>
          <p className="text-lg text-gray-600">We are working hard to bring this page to life. Stay tuned!</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-6 flex items-center text-sm text-gray-500"
      >
        <Wrench className="mr-2" size={18} />
        Developers at work
      </motion.div>
    </div>
  );
}
