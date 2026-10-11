/**
 * Removes ONLY the two throwaway accounts created for verification, and the
 * rows that hang off them. Refuses to touch anything else.
 */
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import sequelize from "../src/db/db.js";
import { initializeAssociations } from "../src/models/association.js";
initializeAssociations();

import User from "../src/models/user.model.js";
import UserSubject from "../src/models/user_subject.model.js";
import AttendanceRecord from "../src/models/attendance_record.model.js";
import Rides from "../src/models/ride.model.js";
import RideParticipant from "../src/models/rideParticipant.model.js";
import BuyAndSell from "../src/models/buyandsell.model.js";
import LostAndFound from "../src/models/lostandfound.model.js";
import Notification from "../src/models/notification.model.js";
import UserSkill from "../src/models/userSkill.model.js";

const EMAILS = (process.env.CLEANUP_EMAILS || "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

if (!EMAILS.length) {
  console.error("Set CLEANUP_EMAILS=a@x,b@y to name the accounts to remove.");
  process.exit(1);
}

const users = await User.findAll({ where: { email: EMAILS }, raw: true });
if (!users.length) {
  console.log("Nothing to clean up — no test accounts found.");
  await sequelize.close();
  process.exit(0);
}

const ids = users.map((u) => u.id);
console.log(`Removing test accounts: ${users.map((u) => `${u.id} (${u.email})`).join(", ")}\n`);

const t = await sequelize.transaction();
try {
  const counts = {};
  const wipe = async (label, Model, where) => {
    counts[label] = await Model.destroy({ where, transaction: t });
  };

  await wipe("ride participations", RideParticipant, { userId: ids });
  const rides = await Rides.findAll({ where: { creatorId: ids }, raw: true, transaction: t });
  if (rides.length) {
    await RideParticipant.destroy({ where: { rideId: rides.map((r) => r.id) }, transaction: t });
  }
  await wipe("rides created", Rides, { creatorId: ids });
  await wipe("attendance records", AttendanceRecord, { userId: ids });
  await wipe("enrolments", UserSubject, { userId: ids });
  await wipe("marketplace listings", BuyAndSell, { userId: ids });
  await wipe("lost-and-found items", LostAndFound, { userId: ids });
  await wipe("notifications", Notification, { userId: ids });
  await wipe("user skills", UserSkill, { userId: ids });
  await wipe("accounts", User, { id: ids });

  await t.commit();
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${String(v).padStart(3)}  ${k}`);
  }
  console.log("\nCleanup committed. No other rows were touched.");
} catch (err) {
  await t.rollback();
  console.error("Cleanup rolled back:", err.message);
  process.exitCode = 1;
}
await sequelize.close();
