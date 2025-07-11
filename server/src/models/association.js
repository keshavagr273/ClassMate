import sequelize from "../db/db.js";
import User from "./user.model.js";
import BuyAndSell from "./buyandsell.model.js";
import LostAndFound from "./lostandfound.model.js";
import { Subject } from "./subject.model.js"; // You already had this
import Rides from "./ride.model.js";
import RideParticipant from "./rideParticipant.model.js";
import { Role, UserRole } from "./role.model.js";
import UserSubject from "./user_subject.model.js";
import AttendanceRecord from "./attendance_record.model.js";

export const initializeAssociations = () => {
  // User - Roles associations (many-to-many)
  User.belongsToMany(Role, { through: UserRole, foreignKey: "user_id" });
  Role.belongsToMany(User, { through: UserRole, foreignKey: "role_id" });

  User.hasMany(LostAndFound, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  LostAndFound.belongsTo(User, { foreignKey: "userId" });

  // User - BuyAndSell associations
  User.hasMany(BuyAndSell, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  BuyAndSell.belongsTo(User, { foreignKey: "userId", as: "users" });

  // User - Rides associations
  User.hasMany(Rides, {
    foreignKey: "creatorId",
    as: "rides",
    onDelete: "CASCADE",
  });
  Rides.belongsTo(User, {
    foreignKey: "creatorId",
    as: "creator",
  });
  Rides.hasMany(RideParticipant, { foreignKey: "rideId", as: "participants" });
  RideParticipant.belongsTo(Rides, { foreignKey: "rideId" });

  User.belongsToMany(Subject, {
    through: UserSubject,
    foreignKey: "userId",
    otherKey: "subjectId",
    as: "enrolledSubjects",
  });
  Subject.belongsToMany(User, {
    through: UserSubject,
    foreignKey: "subjectId",
    otherKey: "userId",
    as: "enrolledUsers",
  });

  User.hasMany(UserSubject, { foreignKey: "userId", as: "enrollments" });
  UserSubject.belongsTo(User, { foreignKey: "userId" });
  Subject.hasMany(UserSubject, { foreignKey: "subjectId", as: "enrollments" });
  UserSubject.belongsTo(Subject, { foreignKey: "subjectId" });

  User.hasMany(AttendanceRecord, {
    foreignKey: "userId",
    as: "attendanceRecords",
    onDelete: "CASCADE",
  });
  AttendanceRecord.belongsTo(User, {
    foreignKey: "userId",
    as: "student",
  });

  Subject.hasMany(AttendanceRecord, {
    foreignKey: "subjectId",
    as: "attendanceRecords",
    onDelete: "CASCADE",
  });
  AttendanceRecord.belongsTo(Subject, {
    foreignKey: "subjectId",
    as: "subject",
  });
};

export {
  User,
  LostAndFound,
  BuyAndSell,
  Subject,
  Rides,
  RideParticipant,
  Role,
  UserRole,
  UserSubject,
  AttendanceRecord,
};
