const { DataTypes } = require('sequelize');

/**
 * Model for the type of damage, for instance ["not_working", "liquid_damage", "fire_damage", "worn_out", "empty", "dirty"]
 * @param {*} sequelize 
 */
module.exports = (sequelize) => {
  sequelize.define('damage', {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  });
}