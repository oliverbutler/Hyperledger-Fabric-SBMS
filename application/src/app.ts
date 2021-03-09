import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Sequelize } from "sequelize";

// Import Fabric and SQL helpers
import * as fabric from "./fabric.js";

const sequelize: Sequelize = require("./db");

async function assertDatabaseConnectionOk() {
  try {
    await sequelize.authenticate();
    console.log("[DB] Connection has been established successfully.");
  } catch (error) {
    console.error("[DB] Unable to connect to the database:", error);
  }
}
assertDatabaseConnectionOk();

// Setup relationships
const { building, room, asset, type, damage, user } = sequelize.models;

const app = express();
const port = 5000;

// CORS
app.use(cors());

// Body Parser
app.use(bodyParser.json());

// Use our fabric helpers to connect to the gateway
fabric
  .connectGateway()
  .then(() => console.log("[Gateway] Connected to Ledger"));

/**
 * Takes a report from Hyperledger Fabric and populates the fields from
 * the DB
 *
 * @param report
 */
const populateReport = async (report: fabric.Report) => {
  let [buildingDB, roomDB, assetDB, damageDB] = await Promise.all([
    building.findOne({ where: { id: report.buildingId } }),
    room.findOne({ where: { id: report.roomId } }),
    asset.findOne({ where: { id: report.assetId } }),
    damage.findOne({ where: { id: report.damageId } }),
  ]);

  const populated = {
    id: report.reportId,
    reportee: report.reporteeId,
    building: buildingDB,
    room: roomDB,
    asset: assetDB,
    damage: damageDB,
    description: report.description,
    status: report.status,
  };

  return populated;
};

app.get("/", (req, res) => {
  res.json({ alive: true });
});

app.get("/init-ledger", async (req, res) => {
  await fabric.initLedger();
  res.json({ success: true });
});

/**
 * Return all reports on the ledger
 */
app.get("/reports", async (req, res) => {
  let reports = await fabric.getAllReports();

  if (req.query.populate && req.query.populate === "false") {
    res.json(reports);
  } else {
    const populatedReports = await Promise.all(
      reports.map((r) => populateReport(r))
    );
    res.json(populatedReports);
  }
});

/**
 * create a new report
 */
app.post("/reports", async (req, res) => {
  // Get length so we can decide the report ID
  let allRep = await fabric.getAllReports();
  let length = allRep.length;

  if (!req.body.reporteeId)
    res.status(400).json({ error: "Must include reporteeId" });

  if (!req.body.assetId)
    res.status(400).json({ error: "Must include assetId" });

  if (!req.body.damageId)
    res.status(400).json({ error: "Must include damageId" });

  if (!req.body.description)
    res.status(400).json({ error: "Must include description" });

  // Get the target asset so we can get the building, room etc.
  let targetAsset = await asset.findOne({ where: { id: req.body.assetId } });

  if (!targetAsset)
    res.status(400).json({ error: "assetId invalid, asset not found" });

  let targetRoom = await room.findOne({
    where: { id: targetAsset.get("roomId") },
  });

  var newReport = {
    reportId: length + 1,
    reporteeId: parseInt(req.body.reporteeId),
    buildingId: targetRoom.get("id"),
    roomId: targetAsset.get("roomId"),
    assetId: targetAsset.get("id"),
    damageId: parseInt(req.body.damageId),
    description: req.body.description,
  } as fabric.Report;

  res.json(await fabric.createReport(newReport));
});

/**
 * Return individual report by ID
 */
app.get("/report/:id", async (req, res) => {
  let report = await fabric.getReport(req.params.id);

  if (req.query.populate && req.query.populate === "false") {
    res.json(report);
  } else {
    res.json(await populateReport(report));
  }
});

/**
 * Return all buildings
 */
app.get("/buildings", async (req, res) => {
  const data = await building.findAll({});
  res.status(200).json(data);
});

/**
 * Return specific building (including its rooms)
 */
app.get("/building/:id", async (req, res) => {
  const data = await building.findOne({
    where: { id: req.params.id },
    include: [{ model: room, as: "rooms" }],
  });
  res.status(200).json(data);
});

/**
 * Return all rooms within a building
 */
app.get("/building/:id/rooms", async (req, res) => {
  const data = await room.findAll({
    where: { buildingId: req.params.id },
  });
  res.status(200).json(data);
});

/**
 * Return room by roomId
 */
app.get("/room/:rid", async (req, res) => {
  const data = await room.findOne({
    where: { id: req.params.rid },
    include: [
      {
        model: asset,
        as: "assets",
        include: [{ model: type, as: "type" }],
      },
      {
        model: building,
        as: "building",
      },
    ],
  });
  res.status(200).json(data);
});

/**
 * Return a specific room within a building (including its assets)
 */
app.get("/building/:bid/room/:rid", async (req, res) => {
  const data = await room.findOne({
    where: { buildingId: req.params.bid, id: req.params.rid },
    include: [
      {
        model: asset,
        as: "assets",
        include: [{ model: type, as: "type" }],
      },
      {
        model: building,
        as: "building",
      },
    ],
  });
  res.status(200).json(data);
});

/**
 * Return all assets
 */
app.get("/assets", async (req, res) => {
  const data = await asset.findAll({
    include: [{ model: type, as: "type" }],
  });
  res.status(200).json(data);
});

/**
 * Get all damage types
 */
app.get("/damages", async (req, res) => {
  const data = await damage.findAll({});
  res.status(200).json(data);
});

app.get("/users", async (req, res) => {
  const data = await user.findAll({});
  res.status(200).json(data);
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

// Before we close the express server down, disconnect the gateway
process.on("SIGINT", () => {
  fabric.disconnect();
  console.log("[Gateway] Disconnected");
  console.log("Bye bye!");
  process.exit();
});
