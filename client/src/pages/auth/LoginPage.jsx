import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  handleSignIn,
  handleSignUp,
  clearError,
  checkAuthStatus,
} from "../../slices/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const authError = useSelector((state) => state.auth.error);
  const loading = useSelector((state) => state.auth.loading);
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const toastIdRef = useRef(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, tab]);

  // M-5: Return cleanup functions to cancel timers on unmount
  useEffect(() => {
    if (isAuthenticated && !loading) {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.success("Welcome back!", {
        position: "top-right",
        autoClose: 1500,
      });
      const timer = setTimeout(() => {
        navigate("/");
      }, 1800);
      return () => clearTimeout(timer); // cleanup on unmount
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (authError && !loading) {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.error(authError, {
        position: "top-right",
        autoClose: 5000,
      });
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 100);
      return () => clearTimeout(timer); // cleanup on unmount
    }
  }, [authError, loading, dispatch]);

  const handleFormSubmit = async (e, type) => {
    e.preventDefault();
    
    try {
      // Clear any previous errors
      dispatch(clearError());
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      
      const email = e.target.elements.email?.value;
      const password = e.target.elements.password?.value;
      
      // Validate inputs
      if (!email) {
        toast.error("Please enter your email.");
        return;
      }
      if (!password) {
        toast.error("Please enter your password.");
        return;
      }
      
      // Handle login/signup
      if (type === "login") {
        await dispatch(handleSignIn({ email, password })).unwrap();
      } else if (type === "signup") {
        await dispatch(handleSignUp({ email, password })).unwrap();
        toast.success("Account created! You can now log in.");
        e.target.reset();
      }
    } catch (err) {
      // The error is already handled by the Redux slice and displayed via toast
      // This catch block prevents the app from crashing
    }
  };

  return (
    // L-1: Removed duplicate conflicting max-w-[512px] class; kept max-w-[960px]
    <div className="relative flex size-full min-h-screen flex-col bg-[#111a22] overflow-x-hidden" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col w-[512px] max-w-[960px] py-5 flex-1">
          {/* L-2: Proper ARIA tab semantics */}
          <div className="pb-3">
            <div role="tablist" aria-label="Authentication tabs" className="flex border-b border-[#324d67] px-4 gap-12">
              <button
                role="tab"
                id="tab-login"
                aria-selected={tab === "login"}
                aria-controls="panel-auth"
                className={`flex flex-col items-center justify-center border-b-[5px] pb-4 pt-6 ${tab === "login" ? "border-b-[#137feb] text-white" : "border-b-transparent text-[#92adc9]"}`}
                onClick={() => setTab("login")}
              >
                <p className={`text-xl font-extrabold leading-normal tracking-[0.015em] ${tab === "login" ? "text-white" : "text-[#92adc9]"}`}>Login</p>
              </button>
              <button
                role="tab"
                id="tab-signup"
                aria-selected={tab === "signup"}
                aria-controls="panel-auth"
                className={`flex flex-col items-center justify-center border-b-[5px] pb-4 pt-6 ${tab === "signup" ? "border-b-[#137feb] text-white" : "border-b-transparent text-[#92adc9]"}`}
                onClick={() => setTab("signup")}
              >
                <p className={`text-xl font-extrabold leading-normal tracking-[0.015em] ${tab === "signup" ? "text-white" : "text-[#92adc9]"}`}>Sign Up</p>
              </button>
            </div>
          </div>
          {/* Title */}
          <h3 className="text-white tracking-light text-5xl font-extrabold leading-tight px-4 text-center pb-6 pt-10">
            {tab === "login" ? "Welcome back" : "Create your account"}
          </h3>
          {/* Form */}
          <form
            id="panel-auth"
            role="tabpanel"
            aria-labelledby={tab === "login" ? "tab-login" : "tab-signup"}
            onSubmit={(e) => handleFormSubmit(e, tab)}
            className="flex flex-col items-center w-full text-lg"
          >
            <div className="max-w-[480px] w-full px-4 py-3 mx-auto">
              <label className="flex flex-col min-w-40">
                <p className="text-white text-2xl font-bold leading-normal pb-2">Email</p>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="form-input w-full rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#324d67] bg-[#192633] focus:border-[#324d67] h-16 placeholder:text-[#92adc9] p-[22px] text-xl font-normal leading-normal placeholder:text-lg placeholder:text-[#92adc9]"
                  required
                  autoComplete={tab === "signup" ? "email" : "username"}
                />
                {tab === "signup" && (
                  <p className="text-[#92adc9] text-sm font-normal leading-normal mt-2">
                    EMAIL FORMAT: NAME.ROLLNO@iiitsonepat.ac.in<br/>
                    (ROLLNO should be your 8-digit roll number)
                  </p>
                )}
              </label>
            </div>
            <div className="max-w-[480px] w-full px-4 py-3 mx-auto">
              <label className="flex flex-col min-w-40">
                <p className="text-white text-2xl font-bold leading-normal pb-2">Password</p>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="form-input w-full rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#324d67] bg-[#192633] focus:border-[#324d67] h-16 placeholder:text-[#92adc9] p-[22px] pr-16 text-xl font-normal leading-normal placeholder:text-lg placeholder:text-[#92adc9]"
                    required
                    autoComplete={tab === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#92adc9] hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
              </label>
            </div>
            <div className="flex flex-col items-center w-full px-4 py-3 gap-2">
              {/* L-3: Loading spinner and text while request is in flight */}
              <button
                type="submit"
                id="submit-auth"
                disabled={loading}
                className={`w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-[#137feb] text-white text-2xl font-extrabold leading-normal tracking-[0.015em] transition-opacity duration-200 ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-600"}`}
              >
                <span className="truncate flex items-center gap-2 justify-center">
                  {loading && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {loading ? "Please wait..." : tab === "login" ? "Login" : "Sign Up"}
                </span>
              </button>
              <p className="text-[#92adc9] text-lg font-normal leading-normal text-center underline w-full">
                By continuing, you agree to our Terms of Service
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
