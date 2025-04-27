

import { motion, AnimatePresence } from 'framer-motion';
import { FaCode, FaServer, FaDatabase, FaShieldAlt, FaTools, FaCloud, FaLaptopCode, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

const TechnicalSkills = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const skillCategories = [
        {
          title: "Frontend",
          icon: <FaCode className="text-2xl" />,
          skills: [
            { name: "HTML", description: "Standard markup language for creating web pages.", details: "HTML provides the basic structure for web pages, which is enhanced by other technologies like CSS and JavaScript." },
            { name: "CSS", description: "Style sheet language used for designing web pages.", details: "CSS allows you to create visually appealing pages by styling HTML elements, adding colors, grids, and responsive layouts." },
            { name: "JavaScript", description: "Programming language used for web development.", details: "JavaScript makes web pages interactive, enabling dynamic content, animations, and form validations." },
            { name: "React.js", description: "JavaScript library for building user interfaces.", details: "React allows developers to build complex UIs by breaking them into smaller, reusable components." },
            { name: "Next.js", description: "React framework for server-side rendering and static site generation.", details: "Next.js offers optimized performance with automatic code splitting, static site generation, and server-side rendering." },
            { name: "Tailwind CSS", description: "Utility-first CSS framework for creating custom designs.", details: "Tailwind allows you to style directly within your HTML by applying utility classes, reducing the need for custom CSS." },
            { name: "Bootstrap", description: "Popular front-end framework for building responsive web pages.", details: "Bootstrap provides a set of pre-designed UI components, like buttons, grids, and forms, to speed up development." },
          ],
          color: "bg-blue-500"
        },
        {
          title: "Backend",
          icon: <FaServer className="text-2xl" />,
          skills: [
            { name: "Node.js", description: "JavaScript runtime for building server-side applications.", details: "Node.js enables JavaScript to run outside the browser, making it ideal for backend development and APIs." },
            { name: "Express.js", description: "Minimal web framework for Node.js.", details: "Express simplifies server setup by handling routes, middleware, and requests, making it easier to build RESTful APIs." },
            { name: "RESTful APIs", description: "Architectural style for designing networked applications.", details: "REST uses HTTP methods for communication between a client and server, enabling stateless interactions and efficient data transfer." },
            { name: "Redis", description: "In-memory data structure store.", details: "Redis is often used as a cache and message broker due to its low latency and high performance." },
            { name: "WebSockets", description: "Protocol for real-time communication between clients and servers.", details: "WebSockets allow for bi-directional, persistent connections, which are useful in applications requiring real-time updates." },
            { name: "Socket.io", description: "Library for real-time web applications.", details: "Socket.io enables real-time, bidirectional communication between web clients and servers, used for chat applications and games." },
            { name: "TypeScript", description: "Superset of JavaScript that adds static types.", details: "TypeScript provides strong typing and enhanced IDE support, making large codebases easier to maintain and refactor." },
          ],
          color: "bg-green-500"
        },
        {
          title: "Database",
          icon: <FaDatabase className="text-2xl" />,
          skills: [
            { name: "MongoDB", description: "NoSQL database for storing document-oriented data.", details: "MongoDB uses JSON-like documents and is flexible, allowing for easy horizontal scaling." },
            { name: "Mongoose", description: "ODM for MongoDB and Node.js.", details: "Mongoose provides a schema-based solution to interact with MongoDB, offering features like data validation, queries, and hooks." },
            { name: "SQL", description: "Structured Query Language for relational databases.", details: "SQL is used to manage and query relational databases like MySQL and PostgreSQL, with structured data and predefined schemas." },
            { name: "Prisma", description: "Next-generation ORM for Node.js and TypeScript.", details: "Prisma provides a more type-safe, modern approach to working with databases, offering powerful query capabilities." },
            { name: "Serialization", description: "Converting data to a format for storage or transmission.", details: "Serialization ensures that data can be safely transmitted over networks or stored in files or databases." },
          ],
          color: "bg-purple-500"
        },
        {
          title: "Authentication",
          icon: <FaShieldAlt className="text-2xl" />,
          skills: [
            { name: "Bcrypt", description: "Library for hashing passwords.", details: "Bcrypt is a key derivation function that hashes passwords securely, ensuring data integrity and privacy." },
            { name: "Passport.js", description: "Authentication middleware for Node.js.", details: "Passport.js simplifies the process of authenticating users in a Node.js application, supporting multiple strategies (OAuth, JWT, etc.)." },
            { name: "Clerk", description: "Identity management service.", details: "Clerk provides a secure and simple way to handle user sign-ups, sign-ins, and user management." },
            { name: "Auth.js", description: "Framework for handling authentication.", details: "Auth.js simplifies the process of implementing secure user authentication and authorization in web applications." },
            { name: "O-Auth", description: "Open standard for access delegation.", details: "OAuth allows third-party applications to access user data without exposing credentials, ensuring secure authorization." },
            { name: "JWT", description: "JSON Web Token used for secure token-based authentication.", details: "JWT is commonly used for stateless authentication in modern web applications, where tokens carry information about the user." },
          ],
          color: "bg-red-500"
        },
        {
          title: "Dev Tools",
          icon: <FaTools className="text-2xl" />,
          skills: [
            { name: "Git", description: "Version control system for tracking changes in code.", details: "Git enables multiple developers to collaborate on projects, keeping track of changes and facilitating branching and merging." },
            { name: "GitHub", description: "Platform for hosting and managing Git repositories.", details: "GitHub provides remote repositories with features like collaboration, issue tracking, and code review, facilitating teamwork." },
            { name: "Postman", description: "Tool for testing APIs.", details: "Postman allows developers to test and debug RESTful APIs by sending requests and analyzing responses in a user-friendly interface." },
            { name: "Docker", description: "Platform for containerizing applications.", details: "Docker enables consistent environments across development, testing, and production by packaging applications into containers." },
          ],
          color: "bg-yellow-500"
        },
        {
          title: "Deployment",
          icon: <FaCloud className="text-2xl" />,
          skills: [
            { name: "Vercel", description: "Platform for deploying static and serverless websites.", details: "Vercel makes deploying Next.js applications seamless with features like automatic deployments and edge functions." },
            { name: "Netlify", description: "Platform for deploying static websites and serverless functions.", details: "Netlify allows developers to deploy websites directly from Git, with built-in continuous deployment and serverless functions." },
            { name: "Render", description: "Cloud platform for full-stack applications.", details: "Render offers a simple way to deploy, manage, and scale full-stack web applications with automatic updates." },
            { name: "AWS", description: "Cloud computing platform by Amazon.", details: "AWS provides scalable cloud infrastructure services, including compute power, storage, and networking for large applications." },
            { name: "VPS", description: "Virtual Private Server hosting.", details: "VPS provides virtualized servers that offer more control and resources compared to shared hosting, allowing for custom configurations." },
          ],
          color: "bg-indigo-500"
        },
        {
          title: "Programming",
          icon: <FaLaptopCode className="text-2xl" />,
          skills: [
            { name: "Java (DSA)", description: "Programming language and Data Structures & Algorithms.", details: "Java is an object-oriented programming language, and mastering Data Structures & Algorithms (DSA) is essential for optimizing solutions in coding interviews." },
          ],
          color: "bg-pink-500"
        }
      ];

  const openModal = (skill) => {
    setSelectedSkill(skill);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8  ">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-800 dark:text-white"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-600">Technical</span> Skills
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              className="bg-gray-200 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={`${category.color} h-2 w-full`}></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`${category.color} text-white p-3 rounded-full mr-4 shadow-md`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{category.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.button
                      key={skillIndex}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 hover:ring-2 hover:ring-purple-500 hover:text-violet-600  transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openModal(skill)}
                    >
                      {skill.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Skill Modal */}
        <AnimatePresence>
          {isModalOpen && selectedSkill && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full relative mx-2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <FaTimes className="text-xl" />
                </button>
                
                <div className="p-6 pt-10">
                  <div className="flex items-start">
                    <div className={`${skillCategories.find(c => c.skills.some(s => s.name === selectedSkill.name))?.color} text-white p-3 rounded-full mr-4 flex-shrink-0`}>
                      {skillCategories.find(c => c.skills.some(s => s.name === selectedSkill.name))?.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                        {selectedSkill.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                        {skillCategories.find(c => c.skills.some(s => s.name === selectedSkill.name))?.title}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {selectedSkill.description}
                    </p>
                    
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Details</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedSkill.details}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <motion.button
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                    >
                      Got it!
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skill Proficiency Section */}
        <motion.div 
          className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Skill Proficiency</h3>
          <div className="space-y-5">
            {[
              { skill: "React.js", level: 90 },
              { skill: "Node.js", level: 85 },
              { skill: "Next.js", level: 80 },
              { skill: "MongoDB", level: 75 },
              { skill: "TypeScript", level: 70 }
            ].map((item, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.skill}</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.level}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <motion.div
                    className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.level}%` }}
                    transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TechnicalSkills;