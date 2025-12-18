'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Loader2, Globe } from 'lucide-react'

const PortfolioPageComponent = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="h-full flex items-center justify-center"
        initial={{ y: "-200vh" }}
        animate={{ y: "0" }}
        transition={{ duration: 1 }}
      >
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="h-full flex items-center justify-center"
        initial={{ y: "-200vh" }}
        animate={{ y: "0" }}
        transition={{ duration: 1 }}
      >
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </motion.div>
    );
  }

  if (projects.length === 0) {
    return (
      <motion.div 
        className="h-full flex flex-col items-center justify-center text-center p-6"
        initial={{ y: "-200vh" }}
        animate={{ y: "0" }}
        transition={{ duration: 1 }}
      >
        <Globe className="w-24 h-24 text-purple-500 mb-4" />
        <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
          No Projects Yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Check back soon for exciting projects!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="h-full flex flex-col text-center p-4 sm:p-6 overflow-y-auto"
      initial={{ y: "-200vh" }}
      animate={{ y: "0" }}
      transition={{ duration: 1 }}
    >
      {/* Header Section */}
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">
          My Projects
        </h1>
        <p className="text-base sm:text-lg max-w-3xl mx-auto font-medium text-gray-600 dark:text-gray-300 px-4">
          A showcase of my recent work and creative projects. Each one represents a unique challenge and learning experience.
        </p>
      </motion.div>

      {/* Projects Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-5 max-w-7xl mx-auto w-full">
        {projects.map((project, index) => (
          <motion.div
            key={project._id}
            className="group relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          >
            {/* Project Card */}
            <div className="h-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              {/* Image Container */}
              <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <ExternalLink className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Beautiful Live Link Button */}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="w-4 h-4" />
                  <span>Live Demo</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>

              {/* Bottom Border Accent */}
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Spacing */}
      <div className="h-8 sm:h-12"></div>
    </motion.div>
  );
}

export default PortfolioPageComponent