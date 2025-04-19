import React from 'react';
import { motion } from 'framer-motion';
import { data } from '../restApi.json';

const WhoAreWe = () => {
  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.6, 0.05, -0.01, 0.9],
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="who_are_we">
      {/* Background decoration */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-pink-50 rounded-full opacity-70"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-50 rounded-full opacity-70"></div>
      
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.span variants={cardVariants} className="inline-block text-indigo-600 font-medium text-sm tracking-wider uppercase mb-2">
            Our Identity
          </motion.span>
          <motion.h2 variants={cardVariants} className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Who Are We
          </motion.h2>
          <motion.div variants={cardVariants} className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto"></motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
        >
          {/* First column with first two cards */}
          <div className="space-y-8">
            {data[0].who_we_are.slice(0, 2).map(element => (
              <motion.div
                key={element.id}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center lg:text-left"
              >
                <div className="flex flex-col lg:flex-row items-center">
                  <span className="text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 lg:mb-0 lg:mr-6">
                    {element.number}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{element.title}</h3>
                    <p className="text-gray-600">{element.description || "Excellence in every bite and moment we create for our valued customers."}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Center image */}
          <motion.div 
            variants={imageVariants}
            className="relative flex justify-center py-6"
          >
            <div className="relative">
              <motion.img
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="w-full max-w-md mx-auto"
                src="center.svg"
                alt="gradientBg"
              />
              <motion.img
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5"
                src="whoweare.png"
                alt="food"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Third column with last two cards */}
          <div className="space-y-8">
            {data[0].who_we_are.slice(2).map(element => (
              <motion.div
                key={element.id}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center lg:text-left"
              >
                <div className="flex flex-col lg:flex-row items-center">
                  <span className="text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 lg:mb-0 lg:mr-6">
                    {element.number}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{element.title}</h3>
                    <p className="text-gray-600">{element.description || "Bringing culinary artistry and exceptional service to every dining experience."}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-20 text-center"
        >
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Our passion for culinary excellence drives us to create memorable dining experiences that bring people together through the joy of exceptional food.
          </p>
          <button className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-medium rounded-full hover:bg-indigo-50 transition duration-300">
            Learn Our Story
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhoAreWe;