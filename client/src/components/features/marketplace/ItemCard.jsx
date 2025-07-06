import React, { useState } from "react";
import {
  FaRupeeSign,
  FaTrash,
  FaShareAlt,
  FaRegHeart,
  FaHeart,
  FaEdit,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { IoMdCall, IoMdTime } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { deleteItem } from "../../../slices/buyandsellSlice";

function ItemCard({ item, onEdit }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLiked, setIsLiked] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Check if current user is the owner or admin
  const isOwner = user?.id === item.userId;
  const isAdmin = user?.roles && user.roles.includes("admin");
  const canModify = isOwner || isAdmin;

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteItem(item.id)).unwrap();
      showNotification("Item deleted successfully", "success");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      showNotification(
        "Failed to delete item: " + (error.message || "Unknown error"),
        "error"
      );
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleEdit = () => {
    if (onEdit && canModify) {
      onEdit(item);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: item.item_name,
        text: `Check out this ${item.item_name} for ₹${item.price}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      showNotification("Link copied to clipboard!", "success");
    }
  };

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  // Function to sanitize description text
  const sanitizeDescription = (text) => {
    if (!text) return "";
    // Check if the text looks like an SQL query
    if (/SELECT|INSERT|UPDATE|DELETE.*FROM/i.test(text)) {
      return "No description available";
    }
    return text;
  };

  // Open image in full-screen modal
  const handleImageClick = () => {
    if (item.image_url) {
      setShowImageModal(true);
    }
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => (
    <AnimatePresence>
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleDeleteCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-5 max-w-md w-full shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-500/20 p-3 rounded-full mb-4">
                <FaExclamationTriangle className="text-red-500" size={24} />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Delete Item</h3>

              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{item.item_name}"? This action
                cannot be undone.
              </p>

              <div className="flex gap-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDeleteCancel}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-2 rounded-lg font-medium shadow-lg hover:shadow-red-500/20 transition-all"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Image Modal
  const ImageModal = () => (
    <AnimatePresence>
      {showImageModal && item.image_url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-screen overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10"
            >
              <FaTimes size={18} />
            </motion.button>

            <div className="flex items-center justify-center">
              <motion.img
                src={item.image_url}
                alt={item.item_name}
                className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
                layoutId={`image-${item.id}`}
              />
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
              <h3 className="text-center font-bold">{item.item_name}</h3>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg mx-auto mb-6 flex flex-col relative">
      {/* Actions Overlay */}
      <div className="absolute top-3 right-3 z-10 flex space-x-2">
        {canModify && (
          <>
            <button
              onClick={handleEdit}
              className="p-2 text-yellow-500 hover:text-yellow-400 transition-colors rounded-full bg-yellow-500/10 hover:bg-yellow-500/20"
              title="Edit Item"
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-red-500 hover:text-red-400 transition-colors rounded-full bg-red-500/10 hover:bg-red-500/20"
              title="Delete Item"
            >
              <FaTrash size={16} />
            </button>
          </>
        )}
        <button
          onClick={handleShare}
          className="p-2 text-sky-500 hover:text-sky-400 transition-colors rounded-full bg-sky-500/10 hover:bg-sky-500/20"
          title="Share Item"
        >
          <FaShareAlt size={16} />
        </button>
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`p-2 transition-colors rounded-full ${
            isLiked
              ? "text-pink-500 hover:text-pink-400 bg-pink-500/10 hover:bg-pink-500/20"
              : "text-gray-400 hover:text-gray-300 bg-gray-500/10 hover:bg-gray-500/20"
          }`}
          title={isLiked ? "Unlike" : "Like"}
        >
          {isLiked ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
        </button>
      </div>
      {/* Image */}
      <div
        className="h-48 w-full bg-cover bg-center"
        style={{
          backgroundImage: `url('${item.image_url || "https://source.unsplash.com/random/400x300?phone"}')`,
        }}
      ></div>

      {/* Content */}
      <div className="p-5 space-y-2 flex-1">
        <h3 className="text-xl font-semibold text-amber-400">{item.item_name}</h3>
        <p className="text-sm text-gray-300">{sanitizeDescription(item.description)}</p>

        <div className="flex items-center text-sm text-gray-400 space-x-2">
          {item.item_condition && (
            <span className="bg-green-700 text-xs text-white px-2 py-1 rounded-md">
              {item.item_condition}
            </span>
          )}
          <span>
            • Posted: {new Date(item.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
          </span>
        </div>

        <div className="text-right">
          <span className="inline-block bg-amber-500 text-black text-sm font-bold px-3 py-1 rounded-md shadow">
            ₹ {item.price}
          </span>
        </div>
      </div>

      {/* Footer Button */}
      <div className="bg-gray-900 p-4 border-t border-gray-700">
        <button
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          onClick={() => setShowContact(!showContact)}
        >
          <span className="material-icons text-white text-base">call</span>
          {showContact ? (item.owner_contact || "No contact info") : "Show Contact"}
        </button>
      </div>
    </div>
  );
}

export default ItemCard;
