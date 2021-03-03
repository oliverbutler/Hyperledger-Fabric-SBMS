import express from 'express'
import cors from "cors"

// Import Fabric helpers
import * as fabric from "./fabric.js"

const app = express();
const port = 5000;

// CORS
app.use(cors())

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

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

// Before we close the express server down, disconnect the gateway
process.on('exit', () => {
  fabric.disconnect()
  console.log("[Gateway] Disconnected")
});