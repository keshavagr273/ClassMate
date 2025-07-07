import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Book,
  Hash,
  Star,
  Edit,
  Home,
  AlertCircle,
  Save,
  X,
  Check,
} from "lucide-react";
import Profile from "../../components/ProfilePage/profileCard";
import LoadingScreen from "../../components/common/loading";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUser,
  setIsEditing,
  clearError,
  getUser,
} from "../../slices/profileSlice";
import { handleLogout as handleLogoutThunk } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";

const AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuAL9HZeOk0z6oVZbewclFfytWYrmiOeFM98GMcr5rWUea_HnjXQZyzdnjQX9iXbMROV9RnOjOoKSCNa4SRGn18jhzXQ6JEWbpjo8kExKqYzQ79Cdv3jJ6nk2ARbj-4KogUaZ2IClxaG6qzfgtebAKark3qYvxJwIptKSj6rVMA34qE3o-ZFf0XAR0rWhSlvCFmCcTwJy2bMGOrVTue3-N4bduBpP3IUn_Oklzjl1xzspdSZ9oeVlByZKhRIe785NqO3Bvglpmmr98I";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isEditing, loading, error } = useSelector(
    (state) => state.profile
  );
  const [notification, setNotification] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    branch: "",
    semester: "",
    graduation_year: 2025,
    hostel: "",
  });
  const [editMode, setEditMode] = useState(false);

  const branchOptions = [
    "Electronics and Communication Engineering",
    "Computer Science Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Engineering and Computational Mechanics",
    "Chemical Engineering",
    "Material Engineering",
    "Production and Industrial Engineering",
    "Biotechnology",
  ];

  const semesterOptions = [
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
    "Sixth",
    "Seventh",
    "Eighth",
  ];

  const hostelOptions = [
    "SVBH",
    "DGJH",
    "Tilak",
    "Malviya",
    "Patel",
    "Tandon",
    "PG",
  ];

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const newUserData = {
        name: user.name || "",
        email: user.email || "",
        branch: user.branch || "",
        semester: user.semester || "",
        graduation_year: user.graduation_year || 2025,
        hostel: user.hostel || "",
      };
      setUserData(newUserData);
      setOriginalData(newUserData);
    }
  }, [user]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    if (user) {
      setUserData({
        name: user.name || "",
        email: user.email || "",
        branch: user.branch || "",
        semester: user.semester || "",
        hostel: user.hostel || "",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = {
        name: userData.name,
        branch: userData.branch,
        semester: userData.semester,
        hostel: userData.hostel,
      };

      await dispatch(updateUser(formData)).unwrap();
      dispatch(setIsEditing(false));
      showNotification("Profile updated successfully!");
      setOriginalData(userData);
    } catch (err) {
      showNotification(err?.message || err || "Error updating profile", "error");
      console.error("Error updating profile:", err);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await dispatch(handleLogoutThunk()).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#151a1e] text-white p-6">
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center">
            <AlertCircle className="mr-2" />
            {error}
          </div>
        </div>
      </div>
    );

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#151a1e] text-white p-6">
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center">
            <AlertCircle className="mr-2" />
            User not found.
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Semester",
      value: userData.semester,
      icon: Book,
      isSelect: true,
      color: "text-blue-400",
    },
    {
      label: "Registration",
      value: user.registration_number,
      icon: Hash,
      name: "registration_number",
      readonly: true,
      color: "text-purple-400",
    },
    {
      label: "Hostel",
      value: userData.hostel,
      icon: Home,
      isSelect: true,
      options: hostelOptions,
      color: "text-pink-400",
    },
  ];

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#111a22] overflow-x-hidden" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Profile</p>
          </div>
          <div className="flex p-4">
            <div className="flex w-full flex-col gap-4 items-center">
              <div className="flex gap-4 flex-col items-center">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                  style={{ backgroundImage: `url('${AVATAR_URL}')` }}
                ></div>
                <div className="flex flex-col items-center justify-center">
                  {editMode ? (
                    <input
                      className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-center bg-[#192633] rounded-xl px-4 py-2 mb-2 border border-[#324d67] focus:outline-none"
                      name="name"
                      value={userData.name}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">{userData.name}</p>
                  )}
                  <p className="text-[#92adc9] text-base font-normal leading-normal text-center">{userData.email}</p>
                  {editMode ? (
                    <>
                      <select
                        className="text-[#92adc9] text-base font-normal leading-normal text-center bg-[#192633] rounded-xl px-4 py-2 mt-2 border border-[#324d67] focus:outline-none"
                        name="branch"
                        value={userData.branch}
                        onChange={handleChange}
                      >
                        <option value="">Select Branch</option>
                        {branchOptions.map((branch) => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                      <select
                        className="text-[#92adc9] text-base font-normal leading-normal text-center bg-[#192633] rounded-xl px-4 py-2 mt-2 border border-[#324d67] focus:outline-none"
                        name="semester"
                        value={userData.semester}
                        onChange={handleChange}
                      >
                        <option value="">Select Semester</option>
                        {semesterOptions.map((sem) => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))}
                      </select>
                      <select
                        className="text-[#92adc9] text-base font-normal leading-normal text-center bg-[#192633] rounded-xl px-4 py-2 mt-2 border border-[#324d67] focus:outline-none"
                        name="hostel"
                        value={userData.hostel}
                        onChange={handleChange}
                      >
                        <option value="">Select Hostel</option>
                        {hostelOptions.map((hostel) => (
                          <option key={hostel} value={hostel}>{hostel}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <p className="text-[#92adc9] text-base font-normal leading-normal text-center">{userData.branch}, {userData.semester}</p>
                    </>
                  )}
                </div>
              </div>
              <button
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#233648] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[480px]"
                onClick={editMode ? handleSubmit : handleEdit}
              >
                <span className="truncate">{editMode ? "Save Profile" : "Edit Profile"}</span>
              </button>
              {editMode && (
                <button
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#324d67] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[480px]"
                  onClick={handleCancel}
                >
                  <span className="truncate">Cancel</span>
                </button>
              )}
            </div>
          </div>
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Details</h2>
          <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324d67] py-5">
              <p className="text-[#92adc9] text-sm font-normal leading-normal">Branch</p>
              <p className="text-white text-sm font-normal leading-normal">{userData.branch}</p>
            </div>
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324d67] py-5">
              <p className="text-[#92adc9] text-sm font-normal leading-normal">Semester</p>
              <p className="text-white text-sm font-normal leading-normal">{userData.semester}</p>
            </div>
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324d67] py-5">
              <p className="text-[#92adc9] text-sm font-normal leading-normal">Hostel</p>
              <p className="text-white text-sm font-normal leading-normal">{userData.hostel}</p>
            </div>
          </div>
          <div className="flex px-4 py-3 justify-end">
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#233648] text-white gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]"
              onClick={handleLogoutClick}
            >
              <div className="text-white" data-icon="ArrowLeft" data-size="20px" data-weight="regular">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
                  ></path>
                </svg>
              </div>
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
