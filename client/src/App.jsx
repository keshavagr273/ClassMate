// src/App.jsx

import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

// Layout & Common Components
import NavBar from "./components/common/layout/NavBar";
import LoadingScreen from "./components/common/loading";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./components/common/layout/ScrollToTop";

// Route Protection Components
import ProtectedRoute from "./components/features/auth/ProtectedRoute";
import PublicRoute from "./components/features/auth/PublicRoute";

// Page Components
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/user/ProfilePage";
import Marketplace from "./pages/marketplace/BuyAndSellPage";
import LostAndFound from "./pages/services/LostAndFound";
import NotFound from "./pages/utility/404";
import ServerError from "./pages/utility/500";
import RideShare from "./pages/services/RideShare";
import AdminPanel from "./pages/admin/AdminPanel";
import AttendancePage from "./pages/attendance/AttendancePage";
import LoginPage from "./pages/auth/LoginPage";
import SkillExchangeDashboard from './pages/skill-exchange/SkillExchangeDashboard';
import { InternConnect } from './pages';

function App() {
  const { loading: authLoading, lastChecked } = useSelector(
    (state) => state.auth
  );
  const [showLoading, setShowLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Check if this is the initial app load (not a page reload)
    const hasLoadedBefore = sessionStorage.getItem('appHasLoaded');
    
    if (hasLoadedBefore) {
      // This is a page reload, skip database check
      console.log("🔄 Page reload detected, skipping database health check");
      setDbConnected(true);
      setIsInitialLoad(false);
      setShowLoading(false);
      return;
    }

    // This is the initial load, check database connection
    let retryCount = 0;
    const maxRetries = 3;

    const checkDatabaseConnection = async () => {
      try {
        // Try multiple possible URLs to handle different configurations
        const possibleUrls = [
          'http://localhost:5000/api/users/health',
          'http://localhost:5000/users/health',
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/health`,
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/users/health`
        ];
        
        console.log("🔍 Initial load - Checking database health...");
        
        for (const url of possibleUrls) {
          try {
            console.log(`Trying: ${url}`);
            const response = await axios.get(url, {
              timeout: 3000
            });
            
            if (response.status === 200) {
              setDbConnected(true);
              setIsInitialLoad(false);
              console.log("✅ Database connection established at:", url);
              return; // Success, exit the function
            }
          } catch (urlError) {
            console.log(`❌ Failed at ${url}:`, urlError.message);
            continue; // Try next URL
          }
        }
        
        // If we get here, all URLs failed
        throw new Error("All health check URLs failed");
        
      } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying database connection (${retryCount}/${maxRetries})...`);
          setTimeout(checkDatabaseConnection, 2000);
        } else {
          console.log("⚠️ Max retries reached. Proceeding without database health check.");
          setDbConnected(true); // Proceed anyway after max retries
          setIsInitialLoad(false);
        }
      }
    };

    // Start checking database connection only on initial load
    checkDatabaseConnection();

    // Set a maximum loading time of 10 seconds as fallback
    const loadingTimeout = setTimeout(() => {
      console.log("⏰ Loading timeout reached. Proceeding with app load.");
      setDbConnected(true);
      setIsInitialLoad(false);
      setShowLoading(false);
    }, 10000);

    return () => clearTimeout(loadingTimeout);
  }, []);

  // Mark app as loaded in session storage
  useEffect(() => {
    if (dbConnected && !isInitialLoad) {
      sessionStorage.setItem('appHasLoaded', 'true');
    }
  }, [dbConnected, isInitialLoad]);

  // Show loading screen only during initial load until database is connected AND auth check completes
  if (isInitialLoad && ((authLoading && !lastChecked) || !dbConnected || showLoading)) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#151a1e]">
        <NavBar />
        <main className="flex-1">
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/500" element={<ServerError />} />

            {/* --- Public-only route (not for logged-in users) --- */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* --- Protected Routes --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/rides" element={<RideShare />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/lost-found" element={<LostAndFound />} />
              <Route path="/skill-exchange" element={<SkillExchangeDashboard />} />
            </Route>

            {/* --- New Route --- */}
            <Route path="/intern-connect" element={<InternConnect />} />

            {/* --- Catch-All Route --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
  );
}

export default App;
