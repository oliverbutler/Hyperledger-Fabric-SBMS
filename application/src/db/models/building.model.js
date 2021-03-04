const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('building', {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING
    }
    // has MANY rooms
  });
}