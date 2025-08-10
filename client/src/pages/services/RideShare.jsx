import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, AlertTriangle, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { formatDateTime, isRideActive } from "../../utils/dateUtils";
import RideHeader from "../../components/rides/RideHeader";
import RideFilters from "../../components/rides/RideFilters";
import RideGrid from "../../components/rides/RideGrid";
import RideFormModal from "../../components/rides/RideFormModal";
import {
  getAllRides,
  getUserRides,
  createRide,
  updateRide,
  deleteRide,
  setSearchTerm,
  setFilters,
  joinRide,
  unjoinRide,
} from "../../slices/ridesSlice";

const RideShare = () => {
  const dispatch = useDispatch();
  const {
    rides,
    loading,
    error,
    filteredRides,
    activeFilterCount,
    searchTerm,
    filters,
  } = useSelector((state) => state.rides);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRide, setEditingRide] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchRides = async () => {
        try {
          await dispatch(getAllRides());
          await dispatch(getUserRides());
        } catch (err) {
          console.error("Error fetching rides:", err);
        }
      };
      fetchRides();
    }
  }, [dispatch, isAuthenticated, user]);

  const handleSearchChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingRide) {
        await dispatch(
          updateRide({
            id: editingRide.id,
            formData: { ...formData, creatorId: user.id },
          })
        );
        setEditingRide(null);
      } else {
        await dispatch(createRide({ ...formData, creatorId: user.id }));
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error submitting ride:", err);
    }
  };



  const handleUnjoin = async (rideId) => {
    setActionLoading(true);
    try {
      await dispatch(unjoinRide(rideId)).unwrap();
      setDetailsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to cancel join.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (ride) => {
    setEditingRide(ride);
    setIsFormOpen(true);
    setDetailsModalOpen(false);
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await dispatch(deleteRide(id));
      setDetailsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to delete ride.');
    } finally {
      setActionLoading(false);
    }
  };

  const clearAllFilters = () => {

    dispatch(setSearchTerm(""));
    dispatch(
      setFilters({
        timeFrame: null,
        dateRange: null,
        minSeats: null,
        maxPrice: null,
        direction: null,
        startDate: null,
        endDate: null,
      })
    );
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-teal-900 via-cyan-800 to-blue-900 text-gray-200 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white text-2xl flex items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mr-3"
            >
              <Car className="w-8 h-8 text-purple-400" />
            </motion.div>
            Loading rides...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-teal-900 via-cyan-800 to-blue-900 text-gray-200 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-red-900/50 backdrop-blur-md p-6 rounded-xl border border-red-500/50 max-w-lg mx-auto">
            <div className="flex items-center text-red-400 text-xl mb-4">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Error Loading Rides
            </div>
            <p className="text-white/80">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-900 via-cyan-800 to-blue-900 text-gray-200 flex flex-col">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Ride Share</p>
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#2b3640] text-white text-sm font-medium leading-normal"
                onClick={() => setIsFormOpen(true)}
              >
                <span className="truncate">Offer Ride</span>
              </button>
            </div>
            {/* Ride Cards - vertical stack of horizontal cards */}
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <svg className="animate-spin h-10 w-10 text-[#9eadbd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                <span className="ml-4 text-white text-lg font-medium">Loading rides...</span>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-6 md:py-10 bg-red-900/20 rounded-lg border border-red-500/50">
                <div className="flex flex-col items-center space-y-3">
                  <svg className="text-red-400" width="36" height="36" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"/></svg>
                  <p className="text-red-300 text-base font-medium">Failed to load rides</p>
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-1.5 bg-yellow-500 text-black rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors"
                    disabled={loading}
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              rides.slice(0, 5).map((ride) => (
                <div key={ride.id} className="p-4">
                  <div className="flex items-stretch justify-between gap-4 rounded-xl">
                    <div className="flex flex-[2_2_0px] flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-white text-base font-bold leading-tight">{ride.pickupLocation} to {ride.dropLocation}</p>
                        <p className="text-[#9eadbd] text-sm font-normal leading-normal">Date: {ride.departureDateTime ? new Date(ride.departureDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'} Time: {ride.departureDateTime ? new Date(ride.departureDateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Unknown'} Seats Available: {ride.availableSeats}</p>
                      </div>
                      <button
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#2b3640] text-white text-sm font-medium leading-normal w-fit"
                        onClick={() => handleViewDetails(ride)}
                      >
                        <span className="truncate">View Details</span>
                      </button>
                    </div>
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                      style={{ backgroundImage: `url('${ride.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}')` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
            {/* Offer Ride Modal */}
            <RideFormModal
              isOpen={isFormOpen}
              onClose={() => {
                setIsFormOpen(false);
                setEditingRide(null);
              }}
              onSubmit={handleFormSubmit}
              editingRide={editingRide}
            />
            {/* Ride Details Modal */}
            <AnimatePresence>
              {detailsModalOpen && selectedRide && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#2b3640] p-8 rounded-xl shadow-xl max-w-2xl w-full border border-white/10 flex flex-col gap-4 relative" onClick={e => e.stopPropagation()}>
                    <button type="button" className="absolute top-4 right-4 text-white hover:text-[#9eadbd]" onClick={() => setDetailsModalOpen(false)}>&times;</button>
                    <h2 className="text-xl md:text-2xl font-bold mb-2 text-white text-center">{selectedRide.pickupLocation} to {selectedRide.dropLocation}</h2>
                    <div className="flex flex-col gap-2 text-white">
                      <span>Date: {selectedRide.departureDateTime ? new Date(selectedRide.departureDateTime).toLocaleDateString() : 'Unknown'}</span>
                      <span>Time: {selectedRide.departureDateTime ? new Date(selectedRide.departureDateTime).toLocaleTimeString() : 'Unknown'}</span>
                      <span>Seats Available: {selectedRide.availableSeats}</span>
                      {selectedRide.estimatedCost && <span>Estimated Cost: {selectedRide.estimatedCost}</span>}
                      {selectedRide.phoneNumber && <span>Contact: {selectedRide.phoneNumber}</span>}
                      {selectedRide.description && <span>Description: {selectedRide.description}</span>}
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                      {selectedRide.creatorId === user?.id ? (
                        <>
                          <button className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition" onClick={() => handleEdit(selectedRide)} disabled={actionLoading}>Edit</button>
                          <button className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-500 transition" onClick={() => handleDelete(selectedRide.id)} disabled={actionLoading}>{actionLoading ? 'Deleting...' : 'Delete'}</button>
                        </>
                      ) : (
                        selectedRide.participants && selectedRide.participants.some(p => p.participant?.id === user?.id) ? (
                          <button className="px-4 py-2 text-sm rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 transition" onClick={() => handleUnjoin(selectedRide.id)} disabled={actionLoading}>{actionLoading ? 'Cancelling...' : 'Cancel Join'}</button>
                        ) : (
                          <button className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-500 transition" onClick={() => handleJoin(selectedRide.id)} disabled={actionLoading}>{actionLoading ? 'Joining...' : 'Join Ride'}</button>
                        )
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideShare;
