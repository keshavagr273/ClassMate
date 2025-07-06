import React, { useState } from "react";
import { motion } from "framer-motion";
import { isRideActive } from "../../utils/dateUtils";
import RideCard from "./RideCard";
import { useDispatch, useSelector } from "react-redux";
import { joinRide, unjoinRide } from "../../slices/ridesSlice";
import { toast } from "react-hot-toast";

const RideGrid = ({ rides, currentUser, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const [loadingRideId, setLoadingRideId] = useState(null);

  const handleJoin = async (rideId) => {
    try {
      setLoadingRideId(rideId);
      await dispatch(joinRide(rideId)).unwrap();
      toast.success("Successfully joined the ride!");
    } catch (error) {
      console.error("Error joining ride:", error);
      toast.error(error.message || "Failed to join ride. Please try again.");
    } finally {
      setLoadingRideId(null);
    }
  };

  const handleUnjoin = async (rideId) => {
    try {
      setLoadingRideId(rideId);
      await dispatch(unjoinRide(rideId)).unwrap();
      toast.success("Successfully cancelled ride join!");
    } catch (error) {
      console.error("Error cancelling join:", error);
      toast.error(error.message || "Failed to cancel join. Please try again.");
    } finally {
      setLoadingRideId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {rides.map((ride) => (
        <motion.div
          key={ride.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-black/40 backdrop-blur-lg rounded-xl overflow-hidden border-2 shadow-lg transform transition-all hover:scale-[1.02] hover:shadow-xl ${
            isRideActive(ride.departureDateTime)
              ? "border-purple-500/50 shadow-purple-900/20"
              : "border-gray-700/50"
          }`}
        >
          <RideCard
            ride={ride}
            currentUser={currentUser}
            onEdit={() => onEdit(ride)}
            onDelete={() => onDelete(ride.id)}
            onJoin={handleJoin}
            onUnjoin={handleUnjoin}
            isLoading={loadingRideId === ride.id}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default RideGrid;
