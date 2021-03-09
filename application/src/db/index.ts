import { Sequelize } from "sequelize";
import { createMock } from "./mock/setup"

// Setup an in-memory DB (for now)
const sequelize: Sequelize = new Sequelize('sqlite::memory:')

// Setup the mock
createMock(sequelize);


// Import all of our models, this improves the ease of DB configuration
const models = [
  require("./models/building.model"),
  require("./models/room.model"),
  require("./models/asset.model"),
  require('./models/type.model'),
  require('./models/damage.model'),
  require('./models/user.model')
]

// Define all the models
for (var modelDefine of models) {
  modelDefine(sequelize)
}

// Setup relationships
const { building, room, asset, type } = sequelize.models;

// Building has many Room
building.hasMany(room);
room.belongsTo(building);

// Room has many Asset
room.hasMany(asset);
asset.belongsTo(room)

// Asset has one Type
type.hasMany(asset);
asset.belongsTo(type);

module.exports = sequelize;

