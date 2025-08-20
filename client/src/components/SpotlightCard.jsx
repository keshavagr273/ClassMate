import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const SpotlightCard = ({ image, title, subtitle, description, link }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-[#182634] border border-[#314d68] rounded-lg overflow-hidden shadow-md transition-shadow duration-300"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-32 sm:h-36 md:h-40 object-cover"
      />
      <div className="p-3 sm:p-4 flex flex-col h-full">
        <h3 className="text-white text-base sm:text-lg font-bold">{title}</h3>
        <p className="text-[#90adcb] text-xs sm:text-sm">{subtitle}</p>
        <p className="text-gray-400 text-xs sm:text-sm mt-2 flex-grow">{description}</p>
        <Link to={link}>
          <button className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-[#0c7ff2] hover:underline">
            Read More →
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

export default SpotlightCard; 