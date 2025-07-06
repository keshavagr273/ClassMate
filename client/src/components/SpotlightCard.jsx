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
        className="w-full h-40 object-cover"
      />
      <div className="p-4 flex flex-col h-full">
        <h3 className="text-white text-lg font-bold">{title}</h3>
        <p className="text-[#90adcb] text-sm">{subtitle}</p>
        <p className="text-gray-400 text-sm mt-2 flex-grow">{description}</p>
        <Link to={link}>
          <button className="mt-4 text-sm font-semibold text-[#0c7ff2] hover:underline">
            Read More →
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

export default SpotlightCard; 