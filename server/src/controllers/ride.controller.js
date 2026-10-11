import Rides from "../models/ride.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { Op } from "sequelize";
import RideParticipant from "../models/rideParticipant.model.js";
import sequelize from "../db/db.js";

/** The UI caps seats at 8; the API never did. */
const MAX_SEATS = 8;


export const createRide = asyncHandler(async (req, res) => {
  const {
    pickupLocation,
    dropLocation,
    departureDateTime,
    totalSeats,
    estimatedCost,
    description,
    phoneNumber,
  } = req.body;

  // Validation
  if (!pickupLocation?.trim() || !dropLocation?.trim()) {
    throw new ApiError("Pickup and drop locations are required", 400);
  }

  if (!departureDateTime) {
    throw new ApiError("Departure date and time is required", 400);
  }

  const parsedDeparture = new Date(departureDateTime);
  if (isNaN(parsedDeparture.getTime())) {
    throw new ApiError("Invalid departure date and time format", 400);
  }

  const seats = Number(totalSeats);
  if (!Number.isInteger(seats) || seats < 1 || seats > MAX_SEATS) {
    throw new ApiError(
      `Total seats must be a whole number between 1 and ${MAX_SEATS}`,
      400
    );
  }

  // The form blocks past departures, but the API accepted them, which put
  // already-departed rides into the open list.
  if (parsedDeparture.getTime() < Date.now() - 60 * 1000) {
    throw new ApiError("Departure time cannot be in the past", 400);
  }

  if (estimatedCost && estimatedCost < 0) {
    throw new ApiError("Estimated cost cannot be negative", 400);
  }

  const creatorId = req.user?.id;
  if (!creatorId) {
    throw new ApiError("Authentication required", 401);
  }

  // Deduplication check: Prevent duplicate ride creation within 2 minutes
  const recentDuplicate = await Rides.findOne({
    where: {
      creatorId,
      pickupLocation: pickupLocation.trim(),
      dropLocation: dropLocation.trim(),
      departureDateTime: parsedDeparture,
      status: "OPEN",
      createdAt: {
        [Op.gte]: new Date(Date.now() - 2 * 60 * 1000),
      },
    },
  });

  if (recentDuplicate) {
    return res
      .status(200)
      .json(new ApiResponse(200, recentDuplicate, "Ride already created"));
  }

  try {
    const newRide = await Rides.create({
      creatorId,
      pickupLocation: pickupLocation.trim(),
      dropLocation: dropLocation.trim(),
      departureDateTime: parsedDeparture,
      totalSeats: seats,
      availableSeats: seats,
      estimatedCost,
      description,
      phoneNumber,
      status: "OPEN",
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newRide, "Ride created successfully"));
  } catch (error) {
    console.error("Database error:", error);
    throw new ApiError(
      "Error creating ride in database: " + error.message,
      500
    );
  }
});

export const updateRide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    pickupLocation,
    dropLocation,
    departureDateTime,
    totalSeats,
    estimatedCost,
    description,
    phoneNumber,
    status,
  } = req.body;

  const ride = await Rides.findByPk(id);
  if (!ride) throw new ApiError("Ride not found", 404);

  // Check if user is admin or creator
  if (ride.creatorId !== req.user?.id) {
    throw new ApiError("Unauthorized", 403);
  }

  if (status && !["OPEN", "FULL", "CANCELLED", "COMPLETED"].includes(status)) {
    throw new ApiError(
      "Invalid status. Must be OPEN, FULL, CANCELLED, or COMPLETED",
      400
    );
  }

  // `totalSeats` was previously tested for truthiness, so a value of 0 slipped
  // past this guard and then set totalSeats to 0 while leaving availableSeats
  // untouched. Treat "was it supplied" and "is it valid" as separate questions.
  const seatsSupplied = totalSeats !== undefined && totalSeats !== null;
  const seatsTaken = ride.totalSeats - ride.availableSeats;

  if (seatsSupplied) {
    const n = Number(totalSeats);
    if (!Number.isInteger(n) || n < 1 || n > MAX_SEATS) {
      throw new ApiError(
        `Total seats must be a whole number between 1 and ${MAX_SEATS}`,
        400
      );
    }
    if (n < seatsTaken) {
      throw new ApiError(
        "Cannot reduce total seats below number of seats already taken",
        400
      );
    }
  }

  const parsedDeparture = departureDateTime ? new Date(departureDateTime) : undefined;
  if (departureDateTime && isNaN(parsedDeparture.getTime())) {
    throw new ApiError("Invalid departure date and time format", 400);
  }

  const nextTotalSeats = seatsSupplied ? Number(totalSeats) : ride.totalSeats;
  const nextAvailableSeats = nextTotalSeats - seatsTaken;

  Object.assign(ride, {
    pickupLocation: pickupLocation ? pickupLocation.trim() : ride.pickupLocation,
    dropLocation: dropLocation ? dropLocation.trim() : ride.dropLocation,
    departureDateTime: parsedDeparture ?? ride.departureDateTime,
    totalSeats: nextTotalSeats,
    estimatedCost: estimatedCost ?? ride.estimatedCost,
    description: description ?? ride.description,
    phoneNumber: phoneNumber ?? ride.phoneNumber,
    status: status ?? ride.status,
    availableSeats: nextAvailableSeats,
  });

  /* Keep status consistent with seat count. Previously, adding seats to a FULL
     ride left status at "FULL" while availableSeats went positive — and
     joinRide rejects anything that is not "OPEN", so the ride became
     permanently unjoinable. Only auto-adjust between OPEN and FULL; CANCELLED
     and COMPLETED are deliberate states and must not be overwritten. */
  if (ride.status === "OPEN" && ride.availableSeats <= 0) {
    ride.status = "FULL";
  } else if (ride.status === "FULL" && ride.availableSeats > 0) {
    ride.status = "OPEN";
  }

  await ride.save();
  return res
    .status(200)
    .json(new ApiResponse(200, ride, "Ride updated successfully"));
});

export const deleteRide = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the ride with its participants
  const ride = await Rides.findByPk(id, {
    include: [
      {
        model: RideParticipant,
        as: "participants",
      },
    ],
  });

  if (!ride) {
    throw new ApiError("Ride not found", 404);
  }

  // Check if user is admin or creator
  if (ride.creatorId !== req.user?.id) {
    throw new ApiError("Unauthorized", 403);
  }

  try {
    // First delete all participants
    if (ride.participants && ride.participants.length > 0) {
      await RideParticipant.destroy({
        where: { rideId: id },
      });
    }

    // Then delete the ride
    await ride.destroy();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Ride deleted successfully"));
  } catch (error) {
    console.error("Error deleting ride:", error);
    throw new ApiError("Error deleting ride: " + error.message, 500);
  }
});

export const getRide = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ride = await Rides.findByPk(id, {
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "name", "email"],
      },
      {
        model: RideParticipant,
        as: "participants",
        include: [
          {
            model: User,
            as: "participant",
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
  });

  if (!ride) throw new ApiError("Ride not found", 404);

  return res
    .status(200)
    .json(new ApiResponse(200, ride, "Ride retrieved successfully"));
});

export const getAllRides = asyncHandler(async (req, res) => {
  try {
    const rides = await Rides.findAll({
      where: {
        status: "OPEN",
        departureDateTime: {
          [Op.gt]: new Date(),
        },
      },
      order: [["departureDateTime", "ASC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: RideParticipant,
          as: "participants",
          include: [
            {
              model: User,
              as: "participant",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      limit: 50, // Limit the number of rides returned
    });

    return res
      .status(200)
      .json(new ApiResponse(200, rides, "Rides retrieved successfully"));
  } catch (error) {
    console.error("Error in getAllRides:", error);
    throw new ApiError("Error retrieving rides: " + error.message, 500);
  }
});

export const getUserRides = asyncHandler(async (req, res) => {
  // `req.params.userId || req.user.id` let any authenticated user read another
  // user's records — including the joined participant/seller contact details.
  // The authenticated id wins; a supplied id is honoured only when it matches.
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError("Authentication required", 401);
  }
  if (req.params.userId && String(req.params.userId) !== String(userId)) {
    throw new ApiError("You can only view your own rides", 403);
  }

  try {
    const rides = await Rides.findAll({
      where: { creatorId: userId },
      order: [["departureDateTime", "ASC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: RideParticipant,
          as: "participants",
          include: [
            {
              model: User,
              as: "participant",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      limit: 20, // Limit the number of rides returned
    });

    return res
      .status(200)
      .json(new ApiResponse(200, rides, "User's rides retrieved successfully"));
  } catch (error) {
    console.error("Error in getUserRides:", error);
    throw new ApiError("Error retrieving user rides: " + error.message, 500);
  }
});

export const joinRide = asyncHandler(async (req, res) => {
  const { id } = req.params; // ride ID from URL params
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError("Authentication required", 401);
  }

  await sequelize.transaction(async (t) => {
    // Lock the ride row for the duration of this transaction to prevent race conditions
    const ride = await Rides.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!ride) throw new ApiError("Ride not found", 404);

    if (ride.status !== "OPEN") {
      throw new ApiError("This ride is not available for joining", 400);
    }

    // Check if user is the creator
    if (ride.creatorId === userId) {
      throw new ApiError("You cannot join your own ride", 400);
    }

    // Check if user already joined
    const existingEntry = await RideParticipant.findOne({
      where: { rideId: id, userId },
      transaction: t,
    });
    if (existingEntry) throw new ApiError("You have already joined this ride", 400);

    // Check available seats (authoritative — from locked row)
    if (ride.availableSeats <= 0) {
      throw new ApiError("Ride is already full", 400);
    }

    await RideParticipant.create({ rideId: id, userId }, { transaction: t });
    ride.availableSeats -= 1;
    if (ride.availableSeats === 0) ride.status = "FULL";
    await ride.save({ transaction: t });
    return ride;
  });

  // Fetch updated participants list outside the transaction
  const participants = await RideParticipant.findAll({
    where: { rideId: id },
    include: [{ model: User, as: "participant", attributes: ["id", "name", "email"] }],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, participants, "Joined ride successfully"));
});


export const unjoinRide = asyncHandler(async (req, res) => {
  const { id } = req.params; // ride ID from URL params
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError("Authentication required", 401);
  }

  await sequelize.transaction(async (t) => {
    // Lock the ride row to prevent concurrent modification
    const ride = await Rides.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!ride) throw new ApiError("Ride not found", 404);

    const existingEntry = await RideParticipant.findOne({
      where: { rideId: id, userId },
      transaction: t,
    });
    if (!existingEntry) throw new ApiError("You have not joined this ride", 400);

    await existingEntry.destroy({ transaction: t });
    // Clamped: without the ceiling, data drift could push availableSeats
    // above totalSeats and advertise seats that do not exist.
    ride.availableSeats = Math.min(ride.availableSeats + 1, ride.totalSeats);
    if (ride.status === "FULL") ride.status = "OPEN";
    await ride.save({ transaction: t });
    return ride;
  });

  // Fetch updated participants list outside the transaction
  const participants = await RideParticipant.findAll({
    where: { rideId: id },
    include: [{ model: User, as: "participant", attributes: ["id", "name", "email"] }],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, participants, "Cancelled join successfully"));
});

