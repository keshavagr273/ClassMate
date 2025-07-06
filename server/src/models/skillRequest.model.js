import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';
import User from './user.model.js';
import Skill from './skill.model.js';

const SkillRequest = sequelize.define('SkillRequest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' },
  message: { type: DataTypes.STRING }
});

SkillRequest.belongsTo(User, { as: 'requester' });
SkillRequest.belongsTo(User, { as: 'recipient' });
SkillRequest.belongsTo(Skill);

export default SkillRequest; 