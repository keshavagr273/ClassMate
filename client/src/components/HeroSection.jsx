import React from "react";
import { motion } from "framer-motion";
import collegeImage from '../public/assets/images/college.jpg';

const HeroSection = ({ onExploreClick }) => {
  return (
    <div
      className="relative min-h-[480px] w-full max-w-5xl mx-auto bg-cover bg-center bg-no-repeat rounded-lg shadow-lg flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${collegeImage})`,
        backgroundBlendMode: "darken"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="backdrop-blur-md bg-black/40 p-8 md:p-12 rounded-xl text-center w-full max-w-2xl mx-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-white text-4xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight"
        >
          Welcome to IIIT Sonepat
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-gray-300 text-md md:text-lg font-medium mb-6"
        >
          A hub for innovation, collaboration, and opportunities. Discover tools to connect, grow, and thrive in your academic journey.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <button
            onClick={onExploreClick}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            Explore ClassMate
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSection; 