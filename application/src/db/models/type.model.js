const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('type', {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  });
}