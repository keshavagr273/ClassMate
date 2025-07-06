import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ServerError = () => {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated glitch background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-blue-500 to-purple-800 animate-pulse" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-purple-600 drop-shadow-lg">
            500
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl md:text-3xl text-white mb-6">
            System Glitched!
          </h2>
          <p className="text-cyan-300 mb-8 max-w-md mx-auto">
            Something unexpected fried the circuits. Our devs are debugging the matrix as we speak.
          </p>

          <div className="space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold
                         hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-pink-500/30"
            >
              Retry Connection
            </motion.button>

            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold
                           hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-cyan-500/30"
              >
                Go to Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Neon warning orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            top: `${25 + i * 20}%`,
            left: `${15 + i * 10}%`,
            backgroundColor: "#ff00ff",
            boxShadow: "0 0 8px #ff00ff",
          }}
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{
            duration: 2.2,
            delay: i * 0.4,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};

export default ServerError;
