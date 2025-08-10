import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';

const UserSkill = sequelize.define('UserSkill', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  SkillId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('teach', 'learn'), allowNull: false }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'SkillId', 'type']
    }
  ]
});

export default UserSkill; 