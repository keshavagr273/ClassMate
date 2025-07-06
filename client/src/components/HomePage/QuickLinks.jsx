import { motion } from "framer-motion";
import React from "react";
import {
  Calendar,
  FileText,
  User,
  Phone,
  Newspaper,
  Map,
  Lightbulb,

} from "lucide-react";
import { Link } from "react-router-dom";
import { last } from "lodash";
import { HiAcademicCap } from "react-icons/hi";

const QuickLinks = () => {
  const links = [
    {
      icon: Calendar,
      label: "Academic Calendar",
      description: "View academic schedules and events",
      href: "https://drive.google.com/file/d/1yYKlN_WktRy2SQYdSaAr-8R42w3wGnTs/view?usp=sharing",
      gradient: "from-purple-600 via-pink-500 to-rose-500",
    },
    {
      icon: Phone,
      label: "Contacts",
      description: "Important contact information",
      href: "/contact",
      gradient: "from-amber-500 via-orange-500 to-red-500",
    },
    // Fun Pages Section
    {
      icon: HiAcademicCap, 
      label: "Clubs",
      description: "Explore college clubs and campus communities",
      href: "/clubs",
      gradient: "from-blue-500 via-purple-600 to-pink-500",
    },
  ];

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="py-12 bg-gray-900/1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {links.map((link, index) => (
            <motion.div
              key={link.label}
              variants={cardVariants}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              className="relative group"
            >
              <Link to={link.href}>
                <div
                  className={`
                  relative flex flex-col items-center 
                  p-6 rounded-xl
                  bg-gray-900/90 backdrop-blur-sm
                  border border-gray-700/50
                  group-hover:border-transparent
                  transition duration-300
                  h-full
                `}
                >
                  <div
                    className={`
                    relative p-3 rounded-lg
                    bg-gradient-to-r ${link.gradient}
                    transform group-hover:scale-110 
                    transition duration-300
                    before:absolute before:inset-0 
                    before:blur-sm before:opacity-50
                  `}
                  >
                    <link.icon className="h-8 w-8 text-white relative z-10" />
                  </div>

                  <h3
                    className={`
                    mt-4 text-lg font-semibold
                    text-gray-200 group-hover:bg-gradient-to-r
                    group-hover:${link.gradient}
                    group-hover:bg-clip-text
                    group-hover:text-transparent
                    transition duration-300
                  `}
                  >
                    {link.label}
                  </h3>

                  <p className="mt-2 text-sm text-gray-400 text-center opacity-80 group-hover:opacity-100">
                    {link.description}
                  </p>

                  <motion.span
                    className="mt-4 text-gray-400 group-hover:text-white"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                  >
                    →
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default QuickLinks;
