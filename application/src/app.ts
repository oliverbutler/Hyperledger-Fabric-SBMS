import express from 'express'
import cors from "cors"
import { Sequelize } from "sequelize";

// Import Fabric and SQL helpers
import * as fabric from "./fabric.js"

const sequelize: Sequelize = require('./db')

async function assertDatabaseConnectionOk() {
  try {
    await sequelize.authenticate();
    console.log('[DB] Connection has been established successfully.');
  } catch (error) {
    console.error('[DB] Unable to connect to the database:', error);
  }
}
assertDatabaseConnectionOk();

// Setup relationships
const { building, room, asset, type, damage } = sequelize.models;

const app = express();
const port = 5000;

// CORS
app.use(cors())

// Use our fabric helpers to connect to the gateway
fabric.connectGateway().then(() => console.log("[Gateway] Connected to Ledger"))

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
    damage.findOne({ where: { id: report.damageId } })
  ])

  const populated = {
    id: report.reportId,
    reportee: report.reporteeId,
    building: buildingDB,
    room: roomDB,
    asset: assetDB,
    damage: damageDB,
    description: report.description,
    status: report.status
  }

  return populated;
}

app.get('/', (req, res) => {
  res.json({ "alive": true })
})

app.get('/init-ledger', async (req, res) => {
  await fabric.initLedger();
  res.json({ "success": true })
})

/**
 * Return all reports on the ledger
 */
app.get('/reports', async (req, res) => {
  let reports = await fabric.getAllReports();

  if (req.query.populate && req.query.populate === "true") {
    const populatedReports = await Promise.all(reports.map(r => populateReport(r)))
    console.log(populatedReports)
    res.json(populatedReports)
  } else {
    res.json(reports)
  }
})

/**
 * Return individual report by ID
 */
app.get('/report/:id', async (req, res) => {
  let report = await fabric.getReport(req.params.id);

  if (req.query.populate && req.query.populate === "true") {
    res.json(await populateReport(report))
  } else {
    res.json(report)
  }

})

/**
 * Return all buildings
 */
app.get('/buildings', async (req, res) => {
  const data = await building.findAll({});
  res.status(200).json(data);
})

/**
 * Return specific building (including its rooms)
 */
app.get('/building/:id', async (req, res) => {
  const data = await building.findOne({
    where: { id: req.params.id },
    include: [{ model: room, as: 'rooms' }]
  });
  res.status(200).json(data);
})

/**
 * Return all rooms within a building
 */
app.get('/building/:id/rooms', async (req, res) => {
  const data = await room.findAll({
    where: { buildingId: req.params.id },
  });
  res.status(200).json(data);
})

/**
 * Return a specific room within a building (including its assets)
 */
app.get('/building/:bid/rooms/:rid', async (req, res) => {
  const data = await room.findAll({
    where: { buildingId: req.params.bid, id: req.params.rid },
    include: [{
      model: asset, as: 'assets', include: [
        { model: type, as: 'type' }
      ]
    }]
  });
  res.status(200).json(data);
})

app.get('/damages', async (req, res) => {
  const data = await damage.findAll({});
  res.status(200).json(data);
})

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

// Before we close the express server down, disconnect the gateway
process.on('exit', () => {
  fabric.disconnect()
  console.log("[Gateway] Disconnected")
});