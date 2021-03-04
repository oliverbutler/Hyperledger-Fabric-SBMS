import { Sequelize } from "sequelize"

export const createMock = async (sequelize: Sequelize) => {
  console.log('Will rewrite the SQLite example database, adding some dummy data.');

  await sequelize.sync({ force: true, logging: false });

  await sequelize.models.building.bulkCreate([
    { id: 1, name: 'Urban Sciences Building' },
    { id: 2, name: 'Marjorie Robinson Library' }
  ]);

  await sequelize.models.room.bulkCreate([
    { id: 1, buildingId: 1, name: 'G.062', floor: "G", description: "Lobby" },
    { id: 2, buildingId: 1, name: 'G.038', floor: "G", description: "Unisex Toilet" },
  ]);

  await sequelize.models.asset.bulkCreate([
    { id: 10, roomId: 2, assetTypeId: 2, name: 'TO_0012', description: "Accessible Toilet" },
    { id: 12, roomId: 1, assetTypeId: 4, name: 'CH_0232', description: "Window Bay Seats" },
  ]);

  await sequelize.models.assetType.bulkCreate([
    { id: 1, name: "chair" },
    { id: 2, name: "toilet-accessible" },
    { id: 3, name: "toilet" },
    { id: 4, name: "sofa" },
  ])
}
