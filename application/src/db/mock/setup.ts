import { Sequelize } from "sequelize"

/**
 * Populates the SQLite DB with mock data
 * 
 * @param sequelize 
 */
export const createMock = async (sequelize: Sequelize) => {
  console.log('Will rewrite the SQLite example database, adding some dummy data.');

  await sequelize.sync({ force: true, logging: false });

  const { building, room, asset, type, damage } = sequelize.models;

  // Populate some buildings
  await building.bulkCreate([
    { id: 1, name: 'Urban Sciences Building' },
    { id: 2, name: 'Marjorie Robinson Library' }
  ], { logging: false });

  // Populate some rooms
  await room.bulkCreate([
    { id: 1, buildingId: 1, name: 'G.062', floor: "G", description: "Lobby" },
    { id: 2, buildingId: 1, name: 'G.038', floor: "G", description: "Unisex Toilet" },
  ], { logging: false });

  // Populate asset types
  await type.bulkCreate([
    { id: 1, name: "chair" },
    { id: 2, name: "toilet-accessible" },
    { id: 3, name: "toilet" },
    { id: 4, name: "sofa" },
  ], { logging: false })

  // Populate some assets within the rooms
  await asset.bulkCreate([
    { id: 10, roomId: 2, typeId: 2, name: 'TO_0012', description: "Accessible Toilet" },
    { id: 12, roomId: 1, typeId: 4, name: 'CH_0232', description: "Window Bay Seats" },
  ], { logging: false });

  // Populate some damage types
  await damage.bulkCreate([
    { id: 1, name: "WATER_DAMAGE" },
    { id: 2, name: "FIRE_DAMAGE" },
    { id: 3, name: "NOT_WORKING" },
    { id: 4, name: "WORN_OUT" },
    { id: 5, name: "EMPTY" },
    { id: 6, name: "DIRTY" },
  ], { logging: false });

}
