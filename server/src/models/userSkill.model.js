import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';
import User from './user.model.js';
import Skill from './skill.model.js';

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

// Ensure correct associations for eager loading
UserSkill.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserSkill, { foreignKey: 'userId' });
Skill.hasMany(UserSkill, { foreignKey: 'SkillId' });
UserSkill.belongsTo(Skill, { foreignKey: 'SkillId' });
User.belongsToMany(Skill, { through: UserSkill, foreignKey: 'userId', otherKey: 'SkillId' });
Skill.belongsToMany(User, { through: UserSkill, foreignKey: 'SkillId', otherKey: 'userId' });

export default UserSkill; 