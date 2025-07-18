// src/App.jsx

import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

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
  const dispatch = useDispatch();
  const { loading: authLoading, lastChecked } = useSelector(
    (state) => state.auth
  );

  if (authLoading && !lastChecked) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
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
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
