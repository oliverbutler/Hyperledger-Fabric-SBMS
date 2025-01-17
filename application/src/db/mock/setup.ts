import { Sequelize } from "sequelize";

/**
 * Populates the SQLite DB with mock data
 *
 * @param sequelize
 */
export const createMock = async (sequelize: Sequelize) => {
  console.log(
    "Will rewrite the SQLite example database, adding some dummy data."
  );

  await sequelize.sync({ force: true, logging: false });

  const { building, room, asset, type, damage, user } = sequelize.models;

  // Populate some buildings
  await building.bulkCreate(
    [
      {
        id: 1,
        name: "Urban Sciences Building",
        description: "Houses Computer Science",
      },
      {
        id: 2,
        name: "Marjorie Robinson Library",
        description: "Main University Library",
      },
    ],
    { logging: false }
  );

  // Populate some rooms
  await room.bulkCreate(
    [
      { id: 1, buildingId: 1, name: "G.062", floor: "G", description: "Lobby" },
      {
        id: 2,
        buildingId: 1,
        name: "G.038",
        floor: "G",
        description: "Unisex Toilet",
      },
    ],
    { logging: false }
  );

  // Populate asset types
  await type.bulkCreate(
    [
      { id: 1, name: "chair" },
      { id: 2, name: "toilet-accessible" },
      { id: 5, name: "wash-basin" },
      { id: 3, name: "toilet" },
      { id: 4, name: "sofa" },
    ],
    { logging: false }
  );

  // Populate some assets within the rooms
  await asset.bulkCreate(
    [
      {
        id: 10,
        roomId: 2,
        typeId: 2,
        name: "TO_0012",
        description: "Accessible Toilet",
      },
      {
        id: 15,
        roomId: 2,
        typeId: 5,
        name: "WB_00123",
        description: "Wash Basin",
      },
      {
        id: 12,
        roomId: 1,
        typeId: 4,
        name: "CH_0232",
        description: "Window Bay Seats",
      },
    ],
    { logging: false }
  );

  // Populate some damage types
  await damage.bulkCreate(
    [
      { id: 1, name: "WATER_DAMAGE" },
      { id: 2, name: "FIRE_DAMAGE" },
      { id: 3, name: "NOT_WORKING" },
      { id: 4, name: "WORN_OUT" },
      { id: 5, name: "EMPTY" },
      { id: 6, name: "DIRTY" },
    ],
    { logging: false }
  );

  await user.bulkCreate(
    [
      {
        id: 1,
        userCode: "b00001",
        givenName: "Oliver",
        familyName: "Butler",
        picture:
          "https://avatars.githubusercontent.com/u/47489826?s=460&u=1970e5066668f4f958f26a042a102131c8295130&v=4",
      },
      { id: 2, userCode: "b00002", givenName: "Tom", familyName: "Smith" },
      { id: 3, userCode: "b00003", givenName: "James", familyName: "Harper" },
      { id: 4, userCode: "b00004", givenName: "Sue", familyName: "Brown" },
    ],
    { logging: false }
  );
};
