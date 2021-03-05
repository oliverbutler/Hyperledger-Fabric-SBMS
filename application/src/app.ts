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


const app = express();
const port = 5000;

// CORS
app.use(cors())

// Use our fabric helpers to connect to the gateway
fabric.connectGateway().then(() => console.log("[Gateway] Connected to Ledger"))

app.get('/', (req, res) => {
  res.json({ "alive": true })
})

app.get('/reports', async (req, res) => {
  let reports = await fabric.getAllReports();
  res.json(reports)
})

app.get('/report/:id', async (req, res) => {
  let report = await fabric.getReport('report' + req.params.id);
  res.json(report)
})

/**
 * Return all buildings
 */
app.get('/buildings', async (req, res) => {
  const users = await sequelize.models.building.findAll({});
  res.status(200).json(users);
})

/**
 * Return specific building (including its rooms)
 */
app.get('/building/:id', async (req, res) => {
  const users = await sequelize.models.building.findOne({
    where: { id: req.params.id },
    include: [{ model: sequelize.models.room, as: 'rooms' }]
  });
  res.status(200).json(users);
})

/**
 * Return all rooms within a building
 */
app.get('/building/:id/rooms', async (req, res) => {
  const users = await sequelize.models.room.findAll({
    where: { buildingId: req.params.id },
  });
  res.status(200).json(users);
})

/**
 * Return a specific room within a building (including its assets)
 */
app.get('/building/:bid/rooms/:rid', async (req, res) => {
  const users = await sequelize.models.room.findAll({
    where: { buildingId: req.params.bid, id: req.params.rid },
    include: [{
      model: sequelize.models.asset, as: 'assets', include: [
        { model: sequelize.models.type, as: 'type' }
      ]
    }]
  });
  res.status(200).json(users);
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