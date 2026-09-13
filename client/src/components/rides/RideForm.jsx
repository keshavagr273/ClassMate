import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { toLocalDateTimeInput } from "../../utils/dateUtils";

const RideForm = ({ initialData, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropLocation: "",
    departureDateTime: "",
    totalSeats: 1,
    estimatedCost: "",
    description: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        pickupLocation: initialData.pickupLocation || "",
        dropLocation: initialData.dropLocation || "",
        departureDateTime: toLocalDateTimeInput(initialData.departureDateTime),
        totalSeats: initialData.totalSeats || 1,
        estimatedCost: initialData.estimatedCost ?? "",
        description: initialData.description || "",
        phoneNumber: initialData.phoneNumber || "",
      });
    } else {
      setFormData({
        pickupLocation: "",
        dropLocation: "",
        departureDateTime: "",
        totalSeats: 1,
        estimatedCost: "",
        description: "",
        phoneNumber: "",
      });
    }
  }, [initialData]);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Pickup Location validation
    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required";
    }

    // Drop Location validation
    if (!formData.dropLocation.trim()) {
      newErrors.dropLocation = "Drop location is required";
    }

    // Departure Time validation
    if (!formData.departureDateTime) {
      newErrors.departureDateTime = "Departure time is required";
    } else {
      const departureDate = new Date(formData.departureDateTime);
      const now = new Date();
      if (departureDate < now) {
        newErrors.departureDateTime = "Departure time cannot be in the past";
      }
    }

    // Total Seats validation
    if (!formData.totalSeats || formData.totalSeats < 1) {
      newErrors.totalSeats = "Total seats must be at least 1";
    } else if (formData.totalSeats > 8) {
      newErrors.totalSeats = "Maximum 8 seats allowed";
    }

    // Estimated Cost validation
    if (formData.estimatedCost && formData.estimatedCost < 0) {
      newErrors.estimatedCost = "Cost cannot be negative";
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (validateForm()) {
      const submissionData = {
        ...formData,
        departureDateTime: new Date(formData.departureDateTime).toISOString(),
      };
      onSubmit(submissionData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-full max-h-[80vh] overflow-y-auto px-1"
    >
      {/* Form sections - responsively adjusted */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-gray-200 text-sm font-medium">
            Pickup Location
          </label>
          <input
            type="text"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            className={`w-full bg-gray-800 border ${
              errors.pickupLocation ? "border-red-500" : "border-gray-700"
            } rounded-lg px-3 py-2 text-white text-sm`}
            placeholder="Enter pickup location"
          />
          {errors.pickupLocation && (
            <p className="text-red-500 text-xs">{errors.pickupLocation}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-gray-200 text-sm font-medium">
            Drop Location
          </label>
          <input
            type="text"
            name="dropLocation"
            value={formData.dropLocation}
            onChange={handleChange}
            className={`w-full bg-gray-800 border ${
              errors.dropLocation ? "border-red-500" : "border-gray-700"
            } rounded-lg px-3 py-2 text-white text-sm`}
            placeholder="Enter drop location"
          />
          {errors.dropLocation && (
            <p className="text-red-500 text-xs">{errors.dropLocation}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-gray-200 text-sm font-medium">
            Departure Time
          </label>
          <input
            type="datetime-local"
            name="departureDateTime"
            value={formData.departureDateTime}
            onChange={handleChange}
            className={`w-full bg-gray-800 border ${
              errors.departureDateTime ? "border-red-500" : "border-gray-700"
            } rounded-lg px-3 py-2 text-white text-sm`}
          />
          {errors.departureDateTime && (
            <p className="text-red-500 text-xs">{errors.departureDateTime}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-gray-200 text-sm font-medium">
            Total Seats
          </label>
          <input
            type="number"
            name="totalSeats"
            value={formData.totalSeats}
            onChange={handleChange}
            min="1"
            max="8"
            className={`w-full bg-gray-800 border ${
              errors.totalSeats ? "border-red-500" : "border-gray-700"
            } rounded-lg px-3 py-2 text-white text-sm`}
          />
          {errors.totalSeats && (
            <p className="text-red-500 text-xs">{errors.totalSeats}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-gray-200 text-sm font-medium">
            Estimated Cost (₹)
          </label>
          <input
            type="number"
            name="estimatedCost"
            value={formData.estimatedCost}
            onChange={handleChange}
            min="0"
            className={`w-full bg-gray-800 border ${
              errors.estimatedCost ? "border-red-500" : "border-gray-700"
            } rounded-lg px-3 py-2 text-white text-sm`}
            placeholder="Enter estimated cost"
          />
          {errors.estimatedCost && (
            <p className="text-red-500 text-xs">{errors.estimatedCost}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-gray-200 text-sm font-medium">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`w-full bg-gray-800 border ${
              errors.phoneNumber ? "border-red-500" : "border-gray-700"
            } rounded-lg px-3 py-2 text-white text-sm`}
            placeholder="Enter 10-digit phone number"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs">{errors.phoneNumber}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-gray-200 text-sm font-medium">
          Description (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm h-20 resize-none"
          placeholder="Add any additional information about the ride..."
        />
      </div>

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${
            isSubmitting
              ? "bg-green-800 cursor-not-allowed opacity-75"
              : "bg-green-600 hover:bg-green-700"
          } text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center sm:flex-1`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors sm:flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default RideForm;
