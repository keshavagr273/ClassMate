import React, { useState, useEffect } from "react";
import { FiHome, FiBell } from "react-icons/fi";
import NotificationsAdmin from "../../components/admin/NotificationsAdmin";
import AdminDashboard from "../../components/admin/AdminDashboard";

const AdminPanel = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <AdminDashboard />;
      case "notifications":
        return <NotificationsAdmin />;
      default:
        return <AdminDashboard />;
    }
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FiHome className="mr-3" size={20} />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <FiBell className="mr-3" size={20} />,
    },
  ];

  return (
    <div className="relative flex min-h-screen font-sans bg-gradient-to-br from-gray-900 via-gray-850 to-gray-800 text-gray-100 overflow-hidden">
      {/* Mobile menu toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 bg-gray-900 p-2 rounded shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={
              isSidebarOpen
                ? "M6 18L18 6M6 6l12 12"
                : "M4 6h16M4 12h16M4 18h16"
            }
          ></path>
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-20 bottom-0 left-0 mt-4 mb-4 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-gray-950 shadow-xl h-[calc(100vh-80px-32px)]`}
      >
        <div className="p-6 text-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-yellow-400">Admin Panel</h2>
        </div>
        <nav className="px-4 py-6 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                activePage === item.id
                  ? "bg-yellow-500 text-gray-900 shadow-lg"
                  : "hover:bg-gray-800 hover:text-yellow-400"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-0"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-6 pb-10 px-6 md:ml-64 bg-gray-900 transition-all duration-300">
        {renderPage()}
      </main>
    </div>
  );
};

export default AdminPanel;
