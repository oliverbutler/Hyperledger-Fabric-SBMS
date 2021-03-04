const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('asset', {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    // HAS one type e.g. Soap Dispenser, Chair, 
  });
}