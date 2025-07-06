import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../../slices/authSlice";
import UserCard from "./UserCard";
import { TailSpin } from "react-loader-spinner";
import {
  FiSearch,
  FiUsers,
  FiUserPlus,
  FiGrid,
  FiList
} from "react-icons/fi";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { allUsers = [], isLoading, error } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filteredUsers = allUsers
    .filter((user) => {
      const matchesSearch =
        !searchTerm ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.id && user.id.toString().includes(searchTerm));
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "alphabetical":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });

  const totalUsers = allUsers.length;
  const recentUsers = allUsers.filter((user) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(user.createdAt) > oneWeekAgo;
  }).length;

  return (
    <div className="p-4 md:p-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Admin User Control Center
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Supervise, filter, and act on all users in your system
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-5 border border-gray-700 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-800 text-cyan-300">
              <FiUsers size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-xs uppercase">Total Users</p>
              <h3 className="text-3xl font-bold text-white">{totalUsers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-5 border border-gray-700 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-800 text-green-300">
              <FiUserPlus size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-xs uppercase">New This Week</p>
              <h3 className="text-3xl font-bold text-white">{recentUsers}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 bg-opacity-50 rounded-xl p-5 mb-6 border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search users by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Name (A-Z)</option>
            </select>

            <div className="flex rounded-lg overflow-hidden border border-gray-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 flex items-center transition ${
                  viewMode === "grid"
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-950 text-gray-400 hover:text-white"
                }`}
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 flex items-center transition ${
                  viewMode === "list"
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-950 text-gray-400 hover:text-white"
                }`}
              >
                <FiList size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <TailSpin color="#00BFFF" height={50} width={50} />
        </div>
      )}

      {!isLoading && !error && (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-950 border border-gray-800 rounded-xl">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default AdminDashboard;