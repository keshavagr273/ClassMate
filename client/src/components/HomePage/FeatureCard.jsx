import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// Animation variants
const iconAnimation = {
  rest: { rotate: 0 },
  hover: {
    rotate: [0, -8, 8, -8, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

const arrowAnimation = {
  rest: { x: 0 },
  hover: { x: 5 },
};

const cardAnimation = {
  initial: { opacity: 0, y: 40 },
  inView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const FeatureCard = React.memo(
  ({
    icon: Icon,
    title,
    description,
    href = "/",
    gradient = "from-fuchsia-600 via-purple-600 to-indigo-600",
    height = "h-full",
  }) => {
    const navigate = useNavigate();

    const handleClick = useCallback(
      (e) => {
        e.preventDefault();
        navigate(href);
      },
      [navigate, href]
    );

    const cardClasses = {
      wrapper: `group relative cursor-pointer overflow-hidden rounded-2xl shadow-md bg-[#1a1a1a] hover:ring-2 hover:ring-indigo-500 transition-all duration-300 ${height}`,
      container:
        "relative p-6 sm:p-7 md:p-8 flex flex-col items-center justify-between text-white h-full",
      iconWrapper: `bg-gradient-to-r ${gradient} p-4 rounded-xl shadow-md mb-4 transform transition-transform group-hover:scale-105`,
      icon: "h-10 w-10 sm:h-12 sm:w-12 text-white",
      title: `text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradient}`,
      description: "text-base text-gray-400 text-center mt-2 line-clamp-3",
      learnMore: "mt-4 flex items-center gap-1 text-indigo-400 hover:text-white transition",
      learnMoreText: "text-sm font-medium",
      arrowIcon: "w-4 h-4",
    };

    return (
      <motion.div
        initial="initial"
        whileInView="inView"
        viewport={{ once: true, amount: 0.2 }}
        variants={cardAnimation}
        className={cardClasses.wrapper}
        onClick={handleClick}
      >
        <div className={cardClasses.container}>
          <motion.div
            initial="rest"
            whileHover="hover"
            variants={iconAnimation}
            className={cardClasses.iconWrapper}
          >
            <Icon className={cardClasses.icon} />
          </motion.div>

          <h3 className={cardClasses.title}>{title}</h3>
          <p className={cardClasses.description}>{description}</p>

          <motion.div
            initial="rest"
            whileHover="hover"
            variants={arrowAnimation}
            className={cardClasses.learnMore}
          >
            <span className={cardClasses.learnMoreText}>Open Tool</span>
            <ArrowRight className={cardClasses.arrowIcon} />
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

FeatureCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  href: PropTypes.string,
  gradient: PropTypes.string,
  height: PropTypes.string,
};

export default FeatureCard;
