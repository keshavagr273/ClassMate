import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4A460] via-[#f7b17c] to-[#ffe0c2] text-white">
      <div className="text-center px-6 max-w-xl mt-[-60px]">
        <h1 className="text-9xl font-extrabold text-[#8B0000] mb-6 drop-shadow-md">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          Oops! You've hit a dead end.
        </h2>
        <p className="text-white/90 text-lg md:text-2xl mb-8 leading-relaxed font-medium">
          The page you're looking for might have been removed or never existed. Let's get you back to safety.
        </p>
        <Link
          to="/"
          className="bg-[#8B0000] hover:bg-[#a30000] text-white font-bold text-lg md:text-2xl py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out inline-block"
        >
          ⬅ Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
