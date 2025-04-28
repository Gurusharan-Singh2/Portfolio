'use client'
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const Gallery = () => {
  const allPhotosRef = useRef(null);

  const scrollToGallery = () => {
    allPhotosRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const images = [
    { src: '/A1.webp', alt: 'Professional Portrait', category: 'portrait' },
    { src: '/A2.webp', alt: 'Creative Composition', category: 'creative' },
    { src: '/A3.webp', alt: 'Creative Composition', category: 'creative' },
    { src: '/A4.webp', alt: 'Creative Composition', category: 'creative' },
    { src: '/A5.webp', alt: 'Creative Composition', category: 'creative' },
    { src: '/A6.webp', alt: 'Creative Composition', category: 'creative' },
    { src: '/A7.webp', alt: 'Creative Composition', category: 'creative' },
    { src: '/A8.webp', alt: 'Creative Composition', category: 'creative' },
    { src: '/A9.webp', alt: 'Creative Composition', category: 'creative' },
    { src: '/A10.webp', alt: 'Creative Composition', category: 'creative' },
    { src: '/A11.webp', alt: 'Creative Composition', category: 'creative' },
    
    
    
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 100,
        damping: 15,
      } 
    },
    hover: { scale: 1.05, zIndex: 10 },
    tap: { scale: 0.98 }
  };

  const buttonVariants = {
    initial: { y: 0 },
    hover: { y: -3, scale: 1.03 },
    tap: { scale: 0.98 }
  };

  return (
     <motion.div 
          className="h-full flex flex-col   text-center p-6"
          initial={{ y: "-200vh" }} 
          animate={{ y: "0" }} 
          transition={{ duration: 1 }}
          
        >
      {/* Hero Section - Mobile Optimized */}
      <section className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center">
          {/* Text Content */}
          <div className="mb-8 lg:mb-16 lg:w-[40%] flex flex-col gap-4 lg:gap-8 z-40 order-1 lg:order-none">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-[90px] font-extrabold text-violet-600 dark:text-white leading-tight">
                Gurusharan
              </h1>
              <h1 className="text-3xl md:text-4xl lg:text-[90px] font-extrabold text-violet-600 dark:text-white leading-tight mt-0 lg:mt-12">
                Photography
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-base lg:text-lg text-gray-800 dark:text-gray-200 max-w-lg"
            >
              Capturing moments with precision and artistic vision.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 lg:mt-0"
            >
              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={scrollToGallery}
                className="flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-lg"
              >
                <span>Explore Portfolio</span>
                <FiChevronDown className="text-lg lg:text-xl animate-bounce" />
              </motion.button>
            </motion.div>
          </div>

          {/* Featured Images - Mobile Stacked */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-[95%] lg:w-[50%] grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 relative order-0 lg:order-none mb-8 lg:mb-0"
          >
            <motion.div
              variants={item}
              className="relative aspect-[3/4] overflow-hidden rounded-xl lg:rounded-2xl shadow-lg lg:shadow-2xl"
            >
              <Image
                src='/A1.webp'
                alt="Featured Portrait"
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 30vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-end p-4 lg:p-6">
                <span className="text-white text-sm lg:text-lg font-medium">Portrait Series</span>
              </div>
            </motion.div>
            
            <motion.div
              variants={item}
              className="relative aspect-[3/4] overflow-hidden rounded-xl lg:rounded-2xl shadow-lg lg:shadow-2xl mt-0 sm:mt-8 lg:mt-12"
            >
              <Image
                src='/A3.webp'
                alt="Featured Creative"
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 30vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-end p-4 lg:p-6">
                <span className="text-white text-sm lg:text-lg font-medium">Creative Series</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Full Gallery Section - Mobile Optimized */}
      <section 
        ref={allPhotosRef}
        className="w-full py-12 lg:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-8 lg:mb-16 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-4">
              Portfolio Collection
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Explore my complete collection of photographic work
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 xl:gap-8"
          >
            <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="relative aspect-[4/5] overflow-hidden rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Gallery;