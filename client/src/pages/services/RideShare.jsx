import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Car, Plus, SearchX } from "lucide-react";
import RideFilters from "../../components/rides/RideFilters";
import RideGrid from "../../components/rides/RideGrid";
import RideFormModal from "../../components/rides/RideFormModal";
import {
  createRide,
  deleteRide,
  getAllRides,
  getUserRides,
  joinRide,
  setFilters,
  setSearchTerm,
  unjoinRide,
  updateRide,
} from "../../slices/ridesSlice";
import {
  Button,
  EmptyState,
  Eyebrow,
  Modal,
  PageShell,
  SectionHeader,
  SkeletonCard,
} from "../../components/ui";

const emptyFilters = {
  timeFrame: null,
  dateRange: null,
  minSeats: null,
  maxPrice: null,
  direction: null,
  startDate: null,
  endDate: null,
};

const RideShare = () => {
  const dispatch = useDispatch();
  const { rides, loading, error, filteredRides, searchTerm, filters } =
    useSelector((state) => state.rides);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRide, setEditingRide] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRideId, setLoadingRideId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getAllRides());
      dispatch(getUserRides());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  /* --------------------------------------------------------------- actions */

  const handleFormSubmit = async (formData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editingRide) {
        await dispatch(
          updateRide({
            id: editingRide.id,
            formData: { ...formData, creatorId: user.id },
          })
        ).unwrap();
        toast.success("Ride updated.");
        setEditingRide(null);
      } else {
        await dispatch(createRide({ ...formData, creatorId: user.id })).unwrap();
        toast.success("Ride posted.");
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err?.message || "Could not save that ride.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Join/unjoin live here only. RideGrid used to dispatch these itself as
  // well, so a single click would have fired two thunks.
  const handleJoin = async (rideId) => {
    setLoadingRideId(rideId);
    try {
      await dispatch(joinRide(rideId)).unwrap();
      toast.success("You are on this ride.");
    } catch (err) {
      toast.error(err?.message || "Could not join that ride.");
    } finally {
      setLoadingRideId(null);
    }
  };

  const handleUnjoin = async (rideId) => {
    setLoadingRideId(rideId);
    try {
      await dispatch(unjoinRide(rideId)).unwrap();
      toast.success("You have left the ride.");
    } catch (err) {
      toast.error(err?.message || "Could not leave that ride.");
    } finally {
      setLoadingRideId(null);
    }
  };

  const handleEdit = (ride) => {
    setEditingRide(ride);
    setIsFormOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteRide(confirmDelete)).unwrap();
      toast.success("Ride deleted.");
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err?.message || "Could not delete that ride.");
    } finally {
      setDeleting(false);
    }
  };

  const clearAllFilters = () => {
    dispatch(setSearchTerm(""));
    dispatch(setFilters(emptyFilters));
  };

  const handleFilterChange = (filterType, value) =>
    dispatch(setFilters({ [filterType]: value }));

  /* ---------------------------------------------------------------- render */

  // The slice already computes filteredRides; the page used to render
  // rides.slice(0, 5) and ignore it.
  const visibleRides = filteredRides ?? rides;
  const initialLoading = loading && !rides.length;
  const hasFilters =
    Boolean(searchTerm) ||
    Object.entries(filters).some(
      ([key, value]) => key !== "sortBy" && value !== null && value !== ""
    );

  return (
    <PageShell width="wide">
      <SectionHeader
        eyebrow="RideLoop"
        tone="ride"
        rule
        title="Shared rides"
        description="Heading to the station or the airport? Split the fare with someone going the same way."
        size="h2"
        action={
          <Button
            leadingIcon={Plus}
            onClick={() => {
              setEditingRide(null);
              setIsFormOpen(true);
            }}
          >
            Offer a ride
          </Button>
        }
      />

      {/* Search and filters, reconnected. The Redux state and every handler
          already existed but were wired to no UI at all. */}
      <div className="mt-10">
        <RideFilters
          searchTerm={searchTerm}
          onSearchChange={(value) => dispatch(setSearchTerm(value))}
          filters={filters}
          onFilterChange={handleFilterChange}
          clearAllFilters={clearAllFilters}
        />
      </div>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <Eyebrow>Available</Eyebrow>
          <span className="numeric text-micro text-ink-4">
            {visibleRides.length}
            {hasFilters && rides.length ? ` of ${rides.length}` : ""}
          </span>
        </div>

        <div className="mt-6">
          {initialLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : visibleRides.length > 0 ? (
            <RideGrid
              rides={visibleRides}
              currentUser={user}
              onEdit={handleEdit}
              onDelete={(id) => setConfirmDelete(id)}
              onJoin={handleJoin}
              onUnjoin={handleUnjoin}
              loadingRideId={loadingRideId}
            />
          ) : hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="No rides match those filters"
              description="Try a wider date range, or clear the filters to see everything."
              action={
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Car}
              title="No rides posted yet"
              description="Offer one and anyone heading the same way can split the fare with you."
              action={
                <Button size="sm" onClick={() => setIsFormOpen(true)}>
                  Offer a ride
                </Button>
              }
            />
          )}
        </div>
      </section>

      <RideFormModal
        isOpen={isFormOpen}
        editingRide={editingRide}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingRide(null);
        }}
        isSubmitting={isSubmitting}
      />

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        size="sm"
        title="Delete this ride?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={handleDeleteConfirmed}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-ui text-ink-2">
          Anyone who joined will be removed from it. This cannot be undone.
        </p>
      </Modal>
    </PageShell>
  );
};

export default RideShare;
