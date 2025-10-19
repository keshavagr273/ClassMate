import sequelize from "../db/db.js";
import User from "./user.model.js";
import BuyAndSell from "./buyandsell.model.js";
import LostAndFound from "./lostandfound.model.js";
import { Subject } from "./subject.model.js"; // You already had this
import Rides from "./ride.model.js";
import RideParticipant from "./rideParticipant.model.js";
import UserSubject from "./user_subject.model.js";
import AttendanceRecord from "./attendance_record.model.js";
import Skill from "./skill.model.js";
import UserSkill from "./userSkill.model.js";
import SkillRequest from "./skillRequest.model.js";
import Notification from "./notification.model.js";

export const initializeAssociations = () => {
  // Removed User - Roles associations (many-to-many) because Role model was deleted

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

  // User - Notification associations
  User.hasMany(Notification, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Notification.belongsTo(User, { foreignKey: "userId" });

  // User - Skill associations (many-to-many through UserSkill)
  User.belongsToMany(Skill, {
    through: UserSkill,
    foreignKey: "userId",
    otherKey: "SkillId",
    as: "skills",
  });
  Skill.belongsToMany(User, {
    through: UserSkill,
    foreignKey: "SkillId",
    otherKey: "userId",
    as: "users",
  });

  // UserSkill associations
  UserSkill.belongsTo(User, { foreignKey: "userId" });
  UserSkill.belongsTo(Skill, { foreignKey: "SkillId" });
  
  // Add hasMany associations for direct access
  Skill.hasMany(UserSkill, { foreignKey: "SkillId", as: "userSkills" });
  User.hasMany(UserSkill, { foreignKey: "userId", as: "userSkills" });

  // SkillRequest associations
  SkillRequest.belongsTo(User, { as: "requester", foreignKey: "requesterId" });
  SkillRequest.belongsTo(User, { as: "recipient", foreignKey: "recipientId" });
  SkillRequest.belongsTo(Skill, { foreignKey: "SkillId" });

  // User has many skill requests (as requester and recipient)
  User.hasMany(SkillRequest, { as: "sentRequests", foreignKey: "requesterId" });
  User.hasMany(SkillRequest, { as: "receivedRequests", foreignKey: "recipientId" });
};

export {
  User,
  LostAndFound,
  BuyAndSell,
  Subject,
  Rides,
  RideParticipant,
  UserSubject,
  AttendanceRecord,
  Skill,
  UserSkill,
  SkillRequest,
  Notification,
};
