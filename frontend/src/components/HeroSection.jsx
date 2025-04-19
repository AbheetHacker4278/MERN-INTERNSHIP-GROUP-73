import React from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

const HeroSection = () => {
  return (
    <section className="heroSection" id="heroSection">
      <Navbar />
      <div className="container">
        <motion.div
          className="banner"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="largeBox"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h1 className="title">Delicious</h1>
          </motion.div>

          <motion.div
            className="combined_boxes"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            <div className="imageBox">
              <motion.img
                src="./hero1.png"
                alt="hero"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="textAndLogo">
              <div className="textWithSvg">
                <motion.h1
                  className="title"
                  whileHover={{ scale: 1.1, color: "#ff6347" }}
                >
                  Food
                </motion.h1>
                <motion.h1
                  className="title dishes_title"
                  whileHover={{ scale: 1.1, color: "#ffa500" }}
                >
                  Dishes
                </motion.h1>
                <motion.img
                  src="./threelines.svg"
                  alt="threelines"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                />
              </div>
              <motion.img
                className="logo"
                src="logo.svg"
                alt="logo"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="banner"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.div className="imageBox" whileHover={{ scale: 1.05 }}>
            <img src="hero2.png" alt="hero" />
          </motion.div>
          <motion.h1
            className="title dishes_title"
            whileHover={{ scale: 1.1, color: "#ff1493" }}
          >
            Dishes
          </motion.h1>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
