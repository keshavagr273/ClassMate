import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';

const SkillRequest = sequelize.define('SkillRequest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  requesterId: { type: DataTypes.INTEGER, allowNull: false },
  recipientId: { type: DataTypes.INTEGER, allowNull: false },
  SkillId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' },
  message: { type: DataTypes.STRING }
});

export default SkillRequest; 