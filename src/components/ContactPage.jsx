'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import ThankYouCard from './ThanuCard';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } },
});

const ContactPageComponent = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  const [status, setStatus] = useState(null);
  const [step, setStep] = useState(false);

  const onSubmit = async (data) => {
    setStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setStep(true);
        reset();
      } else {
        setStatus(result.error || '❌ Something went wrong.');
      }
    } catch (err) {
      setStatus('❌ Failed to send. Please try again.');
    }
  };

  return (
    <motion.div
      className="min-h-screen  flex items-center justify-center px-4 sm:px-6 py-10 transition-colors duration-300"
      initial={{ y: '-100vh' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="w-full max-w-2xl   bg-violet-300 dark:bg-gray-600 border-none shadow-xl rounded-2xl p-6 sm:p-8 md:p-12 transition-colors duration-300"
        initial="initial"
        animate="animate"
      >
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100"
          {...fadeIn(0)}
        >
          Contact Me
        </motion.h2>

        {!step ? (
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* Name Field */}
            <motion.div {...fadeIn(0.1)}>
              <label htmlFor="name" className="block mb-1 text-gray-600 dark:text-gray-300 font-medium">
                Name
              </label>
              <input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div {...fadeIn(0.2)}>
              <label className="block mb-1 text-gray-600 dark:text-gray-300 font-medium">
                Email
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </motion.div>

            {/* Message Field */}
            <motion.div {...fadeIn(0.3)}>
              <label className="block mb-1 text-gray-600 dark:text-gray-300 font-medium">
                Message
              </label>
              <textarea
                {...register('message', { required: 'Message is required' })}
                placeholder="Write your message..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {errors.message && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.message.message}
                </p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div {...fadeIn(0.4)}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-violet-600 text-white py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-violet-800 hover:scale-110  transition duration-300"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </motion.div>

            {/* Status Message */}
            {status && (
              <motion.p
                className={`text-center mt-4 font-medium ${
                  status.includes('✅') ? 'text-green-600' : 'text-red-500'
                }`}
                {...fadeIn(0.5)}
              >
                {status}
              </motion.p>
            )}
          </motion.form>
        ) : (
          <ThankYouCard setStep={setStep} />
        )}
      </motion.div>
    </motion.div>
  );
};

export default ContactPageComponent;
