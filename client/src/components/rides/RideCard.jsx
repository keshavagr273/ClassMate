import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Calendar,
  IndianRupee,
  Pencil,
  Phone,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { formatDateTime, isRideActive } from "../../utils/dateUtils";
import ParticipantsModal from "./ParticipantsModal";
import { Badge, Button, Card, IconButton, cn } from "../ui";

const RideCard = ({
  ride,
  onEdit,
  onDelete,
  currentUser,
  onJoin,
  onUnjoin,
  isLoading,
}) => {
  const { roles } = useSelector((state) => state.auth);
  const [showParticipants, setShowParticipants] = useState(false);

  if (!ride) return null;

  const isAdmin = Array.isArray(roles) && roles.includes("admin");
  const isCreator = ride.creatorId === currentUser?.id;
  const hasJoined = ride.participants?.some(
    (p) => p.participant?.id === currentUser?.id
  );
  const isActive = isRideActive(ride.departureDateTime);
  const isFull = ride.availableSeats === 0;

  // Status reads from a 2px left rule rather than a coloured glow.
  const status = isCreator
    ? { rule: "before:bg-accent", label: "Yours", tone: "accent" }
    : !isActive
      ? { rule: "before:bg-line-3", label: "Departed", tone: "neutral" }
      : isFull
        ? { rule: "before:bg-clay", label: "Full", tone: "critical" }
        : { rule: "before:bg-positive", label: "Open", tone: "positive" };

  return (
    <>
      <Card
        padding="none"
        className={cn(
          "relative flex flex-col overflow-hidden",
          "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:content-['']",
          status.rule
        )}
      >
        <div className="flex flex-1 flex-col gap-4 p-5 pl-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 text-h4 leading-snug text-ink">
              {ride.pickupLocation}
              <span className="mx-1.5 text-ink-4" aria-hidden>
                →
              </span>
              {ride.dropLocation}
            </h3>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>

          <dl className="flex flex-col gap-2 border-t border-line pt-3 text-meta">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0 text-ink-4" aria-hidden />
              <dt className="sr-only">Departs</dt>
              <dd className="numeric text-ink-2">
                {formatDateTime(ride.departureDateTime)}
              </dd>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="size-3.5 shrink-0 text-ink-4" aria-hidden />
                <dt className="sr-only">Seats left</dt>
                <dd className="numeric text-ink-2">
                  {ride.availableSeats} left
                </dd>
              </div>
              {ride.costPerPerson != null && (
                <div className="flex items-center gap-1.5">
                  <IndianRupee
                    className="size-3.5 shrink-0 text-ink-4"
                    aria-hidden
                  />
                  <dt className="sr-only">Cost per person</dt>
                  <dd className="numeric text-ink-2">{ride.costPerPerson}</dd>
                </div>
              )}
            </div>
            {ride.creator?.name && (
              <div className="flex items-center gap-2">
                <User className="size-3.5 shrink-0 text-ink-4" aria-hidden />
                <dt className="sr-only">Offered by</dt>
                <dd className="truncate text-ink-2">{ride.creator.name}</dd>
              </div>
            )}
          </dl>

          {ride.notes && (
            <p className="line-clamp-2 text-meta text-ink-3">{ride.notes}</p>
          )}

          {ride.participants?.length > 0 && (
            <button
              type="button"
              onClick={() => setShowParticipants(true)}
              className="self-start text-meta text-ink-4 underline decoration-line-3 underline-offset-4 transition-colors hover:text-ink"
            >
              {ride.participants.length} joined
            </button>
          )}

          <div className="mt-auto flex items-center gap-1.5 border-t border-line pt-4">
            {!isCreator &&
              isActive &&
              (hasJoined ? (
                <Button
                  size="sm"
                  variant="outline"
                  loading={isLoading}
                  onClick={() => onUnjoin(ride.id)}
                >
                  Leave ride
                </Button>
              ) : (
                <Button
                  size="sm"
                  loading={isLoading}
                  disabled={isFull}
                  onClick={() => onJoin(ride.id)}
                >
                  {isFull ? "Full" : "Join ride"}
                </Button>
              ))}

            {hasJoined && ride.creator?.contactNumber && (
              <Button
                as="a"
                href={`tel:${ride.creator.contactNumber}`}
                size="sm"
                variant="ghost"
                leadingIcon={Phone}
              >
                Call
              </Button>
            )}

            {(isCreator || isAdmin) && (
              <div className="ml-auto flex items-center gap-0.5">
                <IconButton
                  icon={Pencil}
                  label="Edit ride"
                  size="sm"
                  onClick={() => onEdit(ride)}
                />
                <IconButton
                  icon={Trash2}
                  label="Delete ride"
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(ride.id)}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      <ParticipantsModal
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        participants={ride.participants || []}
      />
    </>
  );
};

export default RideCard;
