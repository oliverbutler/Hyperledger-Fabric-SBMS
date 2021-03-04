const { Sequelize } = require('sequelize');
import { createMock } from "./mock/setup"

// Setup an in-memory DB (for now)
const sequelize = new Sequelize('sqlite::memory:')

// Setup the mock
createMock(sequelize);


// Import all of our models, this improves the ease of DB configuration
const models = [
  require("./models/building.model"),
  require("./models/room.model"),
  require("./models/asset.model"),
  require('./models/assetType.model')
]

// Define all the models
for (var modelDefine of models) {
  modelDefine(sequelize)
}

// Setup relationships
const { building, room, asset, assetType } = sequelize.models;

// Building 1<->1 Room
building.hasMany(room);
room.belongsTo(building);

// Room 1<->X Asset
room.hasMany(asset);
asset.belongsTo(room)

// Asset 1->1 AssetType
asset.hasOne(assetType);

module.exports = sequelize;

