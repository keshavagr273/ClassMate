import React from "react";
import RideCard from "./RideCard";

/**
 * Purely presentational now.
 *
 * This component used to dispatch joinRide/unjoinRide itself with its own
 * toasts, while RideShare also had handleJoin/handleUnjoin doing the same
 * thing — so wiring the grid up would have fired two thunks per click. Join
 * state is owned by the page and passed down.
 *
 * It also wrapped every RideCard in a second bordered, blurred card, which was
 * a card inside a card. The status border now lives on RideCard.
 */
const RideGrid = ({
  rides,
  currentUser,
  onEdit,
  onDelete,
  onJoin,
  onUnjoin,
  loadingRideId,
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {rides.map((ride) => (
      <RideCard
        key={ride.id}
        ride={ride}
        currentUser={currentUser}
        onEdit={onEdit}
        onDelete={onDelete}
        onJoin={onJoin}
        onUnjoin={onUnjoin}
        isLoading={loadingRideId === ride.id}
      />
    ))}
  </div>
);

export default RideGrid;
