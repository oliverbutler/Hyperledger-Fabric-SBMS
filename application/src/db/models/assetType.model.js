const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('assetType', {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  });
}