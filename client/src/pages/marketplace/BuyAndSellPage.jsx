import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Search,
  Plus,
  Loader2,
  Package,
  Tag,
  Phone,
  Image as ImageIcon,
  Filter,
  AlertCircle,
  X,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ItemCard } from "../../components/features/marketplace";
import { useDispatch, useSelector } from "react-redux";
import {
  createItem,
  getAllItems,
  clearError,
  updateItem,
} from "../../slices/buyandsellSlice";

const userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBWJvG5j5zx3xsOkAIG9LOtqcrI51b7qit6FuaRbfiuPDjQ8i_oRB9IeOksIaPAXHasNcTRWy2ojwvC_4gcunYohFVPv9qoYUZdHkS2wuQzw78v4UlsJEbsuR48QNZtkwb_KYIAAA8ct_j8HKcjcn6DUG4zhkVDUX_NjHME-stU-WaIDVKUKRkFN0kbqfKtkcvCep5Fygxyf6LS6N8HjF8kWIKLAb3nhVxsPs2Pan37brQ6QoTjKujDVbPBwsKk7ASBNv9F8p8lxDs";

const Marketplace = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, loading, error } = useSelector((state) => state.buyAndSell);

  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const [listingItem, setListingItem] = useState({
    item_name: "",
    price: "",
    category: "",
    description: "",
    item_condition: "",
    owner_contact: "",
    image: null,
  });

  const categories = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Accessories",
    "Cycle",
    "Books",
    "Sports",
    "Other",
  ];

  const conditions = [
    { value: "New", label: "New" },
    { value: "Like New", label: "Like New" },
    { value: "Good", label: "Good" },
    { value: "Fair", label: "Fair" },
    { value: "Poor", label: "Poor" },
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!isAuthenticated) {
          navigate("/login", { state: { from: "/marketplace" } });
          return;
        }
        await dispatch(getAllItems());
      } catch (err) {
        showNotification(err.message, "error");
        if (
          err.message.includes("unauthorized") ||
          err.message.includes("login")
        ) {
          navigate("/login", { state: { from: "/marketplace" } });
        }
      }
    };

    if (activeTab === "browse") {
      fetchItems();
    }
    return () => {
      dispatch(clearError());
    };
  }, [activeTab, isAuthenticated, navigate, dispatch]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    // Clear any existing timeout
    if (window.notificationTimeout) {
      clearTimeout(window.notificationTimeout);
    }
    // Set a new timeout to clear the notification after 5 seconds
    window.notificationTimeout = setTimeout(() => setNotification(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setListingItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Image size should be less than 5MB", "error");
        return;
      }
      setListingItem((prev) => ({ ...prev, image: file }));
    }
  };

  const handleEditItem = (item) => {
    setIsEditMode(true);
    setEditItemId(item.id);
    setListingItem({
      item_name: item.item_name,
      price: item.price,
      category: item.category,
      description: item.description,
      item_condition: item.item_condition,
      owner_contact: item.owner_contact,
      image: null, // We can't set the file object directly, but we'll handle this in the UI
      image_url: item.image_url, // Keep track of the existing image URL
    });
    setActiveTab("sell");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sanitize description to prevent SQL queries from displaying
      const sanitizedDescription = listingItem.description?.replace(
        /SELECT|INSERT|UPDATE|DELETE.*FROM/gi,
        "[removed]"
      );

      const formData = new FormData();
      Object.keys(listingItem).forEach((key) => {
        // Skip image_url when creating FormData
        if (key !== "image_url") {
          // Only append image if it exists (for edit mode, it might be null)
          if (key === "image" && listingItem[key] === null && isEditMode) {
            // Don't append null image in edit mode
          } else if (key === "description") {
            // Use sanitized description
            formData.append(key, sanitizedDescription || "");
          } else {
            formData.append(key, listingItem[key]);
          }
        }
      });

      if (isEditMode && editItemId) {
        await dispatch(updateItem({ id: editItemId, formData })).unwrap();
        showNotification("Item updated successfully!", "success");
      } else {
        await dispatch(createItem(formData)).unwrap();
        showNotification("Item listed successfully!", "success");
      }

      // Reset form and go back to browse
      setActiveTab("browse");
      setIsEditMode(false);
      setEditItemId(null);
      setListingItem({
        item_name: "",
        price: "",
        category: "",
        description: "",
        item_condition: "",
        owner_contact: "",
        image: null,
      });
    } catch (err) {
      setNotification({
        type: "error",
        message:
          err.message ||
          (isEditMode ? "Error updating item" : "Error listing item"),
      });
    }
  };

  useEffect(() => {
    if (error) {
      setNotification({
        type: "error",
        message: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !category || item.category === category;
      const matchesPriceRange =
        (!priceRange.min || item.price >= Number(priceRange.min)) &&
        (!priceRange.max || item.price <= Number(priceRange.max));
      return matchesSearch && matchesCategory && matchesPriceRange;
    });

    // Sort items
    switch (sortBy) {
      case "newest":
        return filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return filtered.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "priceLowToHigh":
        return filtered.sort((a, b) => a.price - b.price);
      case "priceHighToLow":
        return filtered.sort((a, b) => b.price - a.price);
      default:
        return filtered;
    }
  }, [items, searchTerm, category, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-gray-900 text-gray-100 flex flex-col">
      <div className="layout-container flex h-full grow flex-col">
        {/* Main Content */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Marketplace</p>
            <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#223649] text-white text-sm font-medium leading-normal"
                onClick={() => { setActiveTab('sell'); setIsEditMode(false); setEditItemId(null); setListingItem({ item_name: '', price: '', category: '', description: '', item_condition: '', owner_contact: '', image: null }); }}
              >
                <span className="truncate">Sell Item</span>
                  </button>
                </div>
            <div className="flex gap-3 p-3 flex-wrap pr-4">
              <div className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer ${!category ? 'bg-[#223649]' : 'bg-[#223649]/40 hover:bg-[#223649]'} `} onClick={() => setCategory("")}>
                <p className="text-white text-sm font-medium leading-normal">All</p>
              </div>
              <div className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer ${category === 'Books' ? 'bg-[#223649]' : 'bg-[#223649]/40 hover:bg-[#223649]'} `} onClick={() => setCategory("Books")}> 
                <p className="text-white text-sm font-medium leading-normal">Books</p>
              </div>
              <div className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer ${category === 'Electronics' ? 'bg-[#223649]' : 'bg-[#223649]/40 hover:bg-[#223649]'} `} onClick={() => setCategory("Electronics")}> 
                <p className="text-white text-sm font-medium leading-normal">Electronics</p>
              </div>
              <div className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer ${category === 'Furniture' ? 'bg-[#223649]' : 'bg-[#223649]/40 hover:bg-[#223649]'} `} onClick={() => setCategory("Furniture")}> 
                <p className="text-white text-sm font-medium leading-normal">Furniture</p>
              </div>
              <div className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer ${category === 'Clothing' ? 'bg-[#223649]' : 'bg-[#223649]/40 hover:bg-[#223649]'} `} onClick={() => setCategory("Clothing")}> 
                <p className="text-white text-sm font-medium leading-normal">Clothing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 pb-2">
                          <input
                placeholder="Search"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#223649] focus:border-none h-10 placeholder:text-[#90adcb] px-4 text-base font-normal leading-normal"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                          />
                        </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                <svg className="animate-spin h-10 w-10 text-[#90adcb]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                <p className="mt-4 text-[#90adcb]">Loading items...</p>
                </div>
              ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                  {filteredAndSortedItems.length > 0 ? (
                  filteredAndSortedItems.map(item => (
                    <ItemCard key={item.id} item={item} onEdit={handleEditItem} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                    <svg className="mx-auto mb-4 text-[#90adcb]" width="48" height="48" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 7V6a3 3 0 013-3h12a3 3 0 013 3v1M3 7v11a3 3 0 003 3h12a3 3 0 003-3V7M3 7h18"/><path stroke="currentColor" strokeWidth="2" d="M16 11a4 4 0 01-8 0"/></svg>
                    <p className="text-[#90adcb] text-lg">No items found</p>
                    </div>
                  )}
                </div>
              )}
            {/* Add/Edit Item Form Modal */}
            <AnimatePresence>
              {activeTab === 'sell' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <motion.form
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                onSubmit={handleSubmit}
                    className="bg-[#223649] p-8 rounded-2xl shadow-xl max-w-lg w-full border border-white/10 flex flex-col gap-4 relative"
                    onClick={e => e.stopPropagation()}
                  >
                    <button type="button" className="absolute top-4 right-4 text-white hover:text-[#90adcb]" onClick={() => setActiveTab('browse')}><X size={24} /></button>
                    <h2 className="text-2xl font-bold mb-2 text-white text-center">{isEditMode ? 'Edit Item' : 'Sell an Item'}</h2>
                    <input type="text" name="item_name" value={listingItem.item_name} onChange={handleInputChange} placeholder="Item Name" className="p-3 bg-[#101a23] rounded-lg text-white placeholder-[#90adcb]" required />
                    <input type="number" name="price" value={listingItem.price} onChange={handleInputChange} placeholder="Price" className="p-3 bg-[#101a23] rounded-lg text-white placeholder-[#90adcb]" required min="0" />
                    <select name="category" value={listingItem.category} onChange={handleInputChange} className="p-3 bg-[#101a23] rounded-lg text-white" required>
                        <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select name="item_condition" value={listingItem.item_condition} onChange={handleInputChange} className="p-3 bg-[#101a23] rounded-lg text-white" required>
                      <option value="">Select Condition</option>
                      {conditions.map(cond => <option key={cond.value} value={cond.value}>{cond.label}</option>)}
                      </select>
                    <textarea name="description" value={listingItem.description} onChange={handleInputChange} placeholder="Description" className="p-3 bg-[#101a23] rounded-lg text-white placeholder-[#90adcb]" rows={3} required />
                    <input type="tel" name="owner_contact" value={listingItem.owner_contact} onChange={handleInputChange} placeholder="Contact Number" className="p-3 bg-[#101a23] rounded-lg text-white placeholder-[#90adcb]" pattern="[0-9]{10}" required />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="p-2 text-white" />
                    <button type="submit" className="mt-2 bg-[#101a23] text-white rounded-lg py-2 font-bold hover:bg-[#223649] transition">{isEditMode ? 'Update Item' : 'Add Item'}</button>
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

export default Marketplace;
