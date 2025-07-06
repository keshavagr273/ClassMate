// LostAndFound.jsx

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Rocket,
  Search,
  Plus,
  Loader2 as Loader, // Use Loader2 for consistency
  Camera,
  MapPin as Map, // Use MapPin for consistency
  Phone,
  Tag,
  Filter,
  SortAsc,
  AlertCircle,
  X,
  Image as ImageIcon, // Added for image preview
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLostItems,
  addLostItem,
  updateLostItem, // Import updateLostItem
  clearLostAndFoundError,
} from "../../slices/lostAndFoundSlice";
import { LostItemCard } from "../../components/features/marketplace";

const LostAndFound = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.lostAndFound);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState(null);

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const [listingItem, setListingItem] = useState({
    item_name: "",
    description: "",
    location_found: "",
    owner_contact: "",
    category: "",
    image: null,
    image_url: null, // To store existing image URL during edit
  });

  const categories = [
    "Electronics",
    "Documents",
    "Keys",
    "Wallets/Purses",
    "Clothing",
    "Accessories",
    "Books/Notes",
    "Cards",
    "Other",
  ];

  useEffect(() => {
    if (activeTab === "browse") {
      dispatch(fetchLostItems());
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (error) {
      setNotification({ type: "error", message: error });
      const timer = setTimeout(() => {
        dispatch(clearLostAndFoundError());
        setNotification(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setListingItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showNotification("Image size should be less than 5MB", "error");
        return;
      }
      // Create a preview URL for the newly selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setListingItem((prev) => ({
          ...prev,
          image: file,
          image_url: reader.result,
        })); // Set image_url for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setListingItem((prev) => ({ ...prev, image: null, image_url: null }));
    // Reset the file input if needed
    const fileInput = document.getElementById("imageUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    if (window.lafNotificationTimeout) {
      clearTimeout(window.lafNotificationTimeout);
    }
    window.lafNotificationTimeout = setTimeout(
      () => setNotification(null),
      4000
    );
  };

  // Function to handle editing an item
  const handleEditItem = (item) => {
    setIsEditMode(true);
    setEditItemId(item.id);
    setListingItem({
      item_name: item.item_name || "",
      description: item.description || "",
      location_found: item.location_found || "",
      owner_contact: item.owner_contact || "",
      category: item.category || "",
      image: null, // Reset image file input
      image_url: item.image_url || null, // Keep existing image URL for preview
    });
    setActiveTab("found"); // Switch to the form tab
  };

  const resetFormAndState = () => {
    setListingItem({
      item_name: "",
      description: "",
      location_found: "",
      owner_contact: "",
      category: "",
      image: null,
      image_url: null,
    });
    setIsEditMode(false);
    setEditItemId(null);
    // Reset file input
    const fileInput = document.getElementById("imageUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation example
    if (
      !listingItem.item_name ||
      !listingItem.category ||
      !listingItem.location_found ||
      !listingItem.owner_contact
    ) {
      showNotification("Please fill in all required fields.", "error");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(listingItem.owner_contact)) {
      showNotification(
        "Please enter a valid 10-digit Indian mobile number.",
        "error"
      );
      return;
    }

    const formData = new FormData();
    // Append all fields except image_url
    Object.keys(listingItem).forEach((key) => {
      if (key !== "image_url") {
        // Only append image if it's a new file (not null)
        if (key === "image" && listingItem[key]) {
          formData.append(key, listingItem[key]);
        } else if (key !== "image") {
          // Append other fields, ensuring empty strings are sent if needed
          formData.append(key, listingItem[key] || "");
        }
      }
    });

    try {
      if (isEditMode && editItemId) {
        // Dispatch update action
        await dispatch(updateLostItem({ id: editItemId, formData })).unwrap();
        showNotification("Item updated successfully!", "success");
      } else {
        // Dispatch add action
        await dispatch(addLostItem(formData)).unwrap();
        showNotification("Item reported successfully!", "success");
      }
      resetFormAndState(); // Reset form and edit state
      setActiveTab("browse"); // Go back to browse tab
    } catch (err) {
      // Error message extraction improvement
      const errorMessage =
        err?.payload ||
        err.message ||
        (isEditMode ? "Error updating item" : "Error reporting item");
      showNotification(errorMessage, "error");
      // Do not switch tab or reset form on error
    }
  };

  const handleCancel = () => {
    resetFormAndState();
    setActiveTab("browse");
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let result = items.filter((item) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        item.item_name?.toLowerCase().includes(lowerSearchTerm) ||
        item.description?.toLowerCase().includes(lowerSearchTerm) ||
        item.location_found?.toLowerCase().includes(lowerSearchTerm);
      const matchesCategory = !category || item.category === category;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "newest":
        return result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return result.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      default:
        return result;
    }
  }, [items, searchTerm, category, sortBy]);

  // Separate loading state for initial fetch vs form submission
  const initialLoading = loading && !items.length; // Loading only when items are empty
  const formSubmitting = loading && activeTab === "found"; // Loading only when submitting form

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black text-gray-300 flex flex-col">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Lost &amp; Found</p>
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#2b3640] text-white text-sm font-medium leading-normal"
                onClick={() => { setActiveTab('found'); resetFormAndState(); }}
              >
                <span className="truncate">Report Item</span>
              </button>
            </div>
            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Recently Reported</h3>
            {/* Recently Reported List */}
            {loading && !items.length ? (
              <div className="flex items-center justify-center py-10">
                <svg className="animate-spin h-10 w-10 text-[#9eadbd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                <span className="ml-4 text-white text-lg font-medium">Loading Lost Items...</span>
              </div>
            ) : error && !items.length ? (
              <div className="col-span-full text-center py-6 md:py-10 bg-red-900/20 rounded-lg border border-red-500/50">
                <div className="flex flex-col items-center space-y-3">
                  <svg className="text-red-400" width="36" height="36" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"/></svg>
                  <p className="text-red-300 text-base font-medium">Failed to load items</p>
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={() => dispatch(fetchLostItems())}
                    className="mt-2 px-4 py-1.5 bg-yellow-500 text-black rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    ) : (
                      "Retry"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              items.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-stretch justify-between gap-4 rounded-xl">
                    <div className="flex flex-[2_2_0px] flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-[#9eadbd] text-sm font-normal leading-normal">{item.is_found ? 'Found' : 'Lost'}</p>
                        <p className="text-white text-base font-bold leading-tight">{item.item_name}</p>
                        <p className="text-[#9eadbd] text-sm font-normal leading-normal">{item.is_found ? 'Found' : 'Lost'} on {item.date_found ? new Date(item.date_found).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'} at {item.location_found || 'Unknown location'}</p>
                      </div>
                      <button
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#2b3640] text-white text-sm font-medium leading-normal w-fit"
                        onClick={() => window.alert(`Contact: ${item.owner_contact || 'Not provided'}`)}
                      >
                        <span className="truncate">Contact Owner</span>
                      </button>
                    </div>
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                      style={{ backgroundImage: `url('${item.image_url || 'https://via.placeholder.com/400x225?text=No+Image'}')` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
            {/* Report Item Form Modal */}
            <AnimatePresence>
              {activeTab === 'found' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <motion.form
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-[#2b3640] p-8 rounded-xl shadow-xl max-w-2xl w-full border border-white/10 flex flex-col gap-4 relative"
                    onClick={e => e.stopPropagation()}
                  >
                    <button type="button" className="absolute top-4 right-4 text-white hover:text-[#9eadbd]" onClick={handleCancel}><X size={24} /></button>
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center text-white">{isEditMode ? 'Edit Reported Item' : 'Report Found Item'}</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">Item Name *</label>
                        <input
                          type="text"
                          name="item_name"
                          value={listingItem.item_name}
                          onChange={handleInputChange}
                          className="w-full p-2.5 text-sm bg-[#151a1e] rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all"
                          required
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">Category *</label>
                        <select
                          name="category"
                          value={listingItem.category}
                          onChange={handleInputChange}
                          className="w-full p-2.5 text-sm bg-[#151a1e] rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">Location Found *</label>
                        <input
                          type="text"
                          name="location_found"
                          value={listingItem.location_found}
                          onChange={handleInputChange}
                          className="w-full p-2.5 text-sm bg-[#151a1e] rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all"
                          required
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">Description</label>
                        <textarea
                          name="description"
                          value={listingItem.description}
                          onChange={handleInputChange}
                          className="w-full p-2.5 text-sm bg-[#151a1e] rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all"
                          rows={3}
                          maxLength={500}
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">Contact Number *</label>
                        <input
                          type="tel"
                          name="owner_contact"
                          value={listingItem.owner_contact}
                          onChange={handleInputChange}
                          className="w-full p-2.5 text-sm bg-[#151a1e] rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all"
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">Image</label>
                        <input
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full p-2.5 text-sm bg-[#151a1e] rounded-lg text-white"
                        />
                        {listingItem.image_url && (
                          <div className="mt-2 flex items-center gap-2">
                            <img src={listingItem.image_url} alt="Preview" className="h-20 rounded-lg object-cover" />
                            <button type="button" onClick={clearImage} className="text-red-400 hover:text-red-600"><X size={20} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm rounded-lg bg-[#23272e] text-white hover:bg-[#2b3640] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium hover:shadow-lg hover:shadow-yellow-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center"><svg className="animate-spin mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Submitting...</span>
                        ) : isEditMode ? 'Update Item' : 'Report Item'}
                      </button>
                    </div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Notification */}
            <AnimatePresence>
              {notification && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold ${notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{notification.message}</motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostAndFound;
