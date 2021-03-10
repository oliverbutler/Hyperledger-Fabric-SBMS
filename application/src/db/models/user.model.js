const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('user', {
    userCode: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    givenName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    familyName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    picture: {
      allowNull: true,
      type: DataTypes.STRING
    }
  });
}