const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('room', {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    floor: {
      allowNull: true,
      type: DataTypes.STRING
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING
    }
    // has MANY Assets
  });
}