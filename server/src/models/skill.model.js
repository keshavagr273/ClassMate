import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';

const Skill = sequelize.define('Skill', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
});

export default Skill; 