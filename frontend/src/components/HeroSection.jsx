import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Navbar from "./Navbar";

const HeroSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, 0.05, -0.01, 0.9],
      },
    },
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white" id="heroSection">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="pt-20 pb-24 md:pt-28 md:pb-32"
        >
          {/* Hero Header */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center mb-12"
          >
            <span className="text-sm font-medium text-indigo-600 tracking-wider uppercase">Experience Culinary Excellence</span>
            <h1 className="mt-2 text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Delicious Food Dishes
            </h1>
            <p className="mt-6 max-w-2xl text-center text-gray-600 text-lg">
              Discover extraordinary flavors and culinary masterpieces crafted with passion
            </p>
          </motion.div>

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <motion.div variants={itemVariants} className="lg:col-span-7 relative">
              <div className="relative">
                <motion.div
                  className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-100 rounded-full z-0 hidden md:block"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                />
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="./hero1.png"
                    alt="Delicious dish presentation"
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col space-y-6">
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Premium Ingredients</h3>
                </div>
                <p className="text-gray-600">Crafted with the finest ingredients sourced from local farmers and global suppliers.</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-pink-100 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Culinary Innovation</h3>
                </div>
                <p className="text-gray-600">Unique recipes that combine traditional methods with modern culinary techniques.</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Seasonal Menus</h3>
                </div>
                <p className="text-gray-600">Our dishes evolve with the seasons, ensuring freshness and sustainability.</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Image */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 flex justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
              className="relative w-full max-w-4xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 transform rotate-1 rounded-2xl"></div>
              <img 
                src="hero2.png" 
                alt="Signature dish" 
                className="relative z-10 w-full h-auto object-cover rounded-xl shadow-xl" 
              />
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 text-center"
          >
            <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:shadow-lg transform transition hover:-translate-y-1">
              Browse Our Menu
            </button>
            <p className="mt-4 text-gray-500">Discover extraordinary flavors today</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 hidden lg:block">
        <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#f0f0ff" d="M57.5,-47.2C74.2,-33.7,87.9,-10.3,84.6,10.2C81.3,30.7,61.1,48.3,39.1,59.3C17,70.3,-6.9,74.7,-30.8,67.4C-54.7,60.1,-78.7,41,-85.7,16.8C-92.7,-7.5,-82.7,-36.8,-65,-52.8C-47.2,-68.8,-23.6,-71.3,-0.5,-70.9C22.6,-70.5,40.9,-60.6,57.5,-47.2Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 hidden lg:block">
        <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#f8f0ff" d="M42.7,-51.7C58.9,-44.7,78.1,-35.5,81.3,-22.6C84.5,-9.7,71.8,6.9,62.9,22.4C54,37.9,48.9,52.3,38.4,60.9C27.9,69.5,12,72.3,-3.5,76.5C-19,80.7,-37.9,86.3,-50.8,79.9C-63.7,73.5,-70.5,55.1,-73,37.8C-75.5,20.5,-73.7,4.3,-66.3,-7.4C-58.9,-19.1,-46,-26.3,-35.3,-34.1C-24.6,-42,-12.3,-50.5,0.6,-51.3C13.5,-52.1,26.5,-58.7,42.7,-51.7Z" transform="translate(100 100)" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;