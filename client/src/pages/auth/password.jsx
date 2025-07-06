import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Import icons from lucide-react

const PasswordInput = ({ name, placeholder, required, autoComplete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="block text-sm font-medium text-purple-700 mb-1">
        Password
      </label>
      <div
        className={`flex items-center w-full p-4 bg-white/5 rounded-lg text-white border ${
          isFocused ? "border-purple-500" : "border-white/10"
        } transition-all`}
      >
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          className="bg-transparent focus:outline-none w-full"
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="text-gray-400 hover:text-white focus:outline-none transition-colors"
          tabIndex="-1" 
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
