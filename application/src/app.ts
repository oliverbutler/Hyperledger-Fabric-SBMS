import express from 'express'

// Import Fabric helpers
import * as fabric from "./fabric.js"

const app = express();
const port = 3000;

fabric.connectGateway().then(() => console.log("Connected to Ledger"))

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get('/report/:id', async (req, res) => {

  let report = await fabric.getReport('report' + req.params.id);
  res.send(report)
})

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

// Before we close the express server down, disconnect the gateway
process.on('exit', () => {
  fabric.disconnect();
});