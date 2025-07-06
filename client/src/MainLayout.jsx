import React, { useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen"; // adjust import as needed
import { useAuth } from "./contexts/AuthContext"; // adjust import as needed

export default function MainLayout({ children }) {
  const { authLoading, lastChecked } = useAuth(); // adjust based on your logic

  // Show loading screen if auth is loading
  if (authLoading && !lastChecked) {
    return <LoadingScreen />;
  }

  return <div className="text-sm">{children}</div>;
} 