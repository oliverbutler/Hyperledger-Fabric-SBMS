"use strict";

const { Gateway, Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const path = require("path");
const {
  buildCAClient,
  registerAndEnrollUser,
  enrollAdmin,
} = require("../fabric-samples/test-application/javascript/CAUtil.js");
const {
  buildCCPOrg1,
  buildWallet,
} = require("../fabric-samples/test-application/javascript/AppUtil.js");
const { report } = require("process");

const channelName = "mychannel";
const chaincodeName = "basic";
const mspOrg1 = "Org1MSP";
const walletPath = path.join(__dirname, "wallet");
const org1UserId = "appUser";


async function main() {
  try {
    // Create an in-memory connection profile
    const ccp = buildCCPOrg1();

    // build an instance of the fabric ca services client based on
    // the information in the network configuration
    const caClient = buildCAClient(
      FabricCAServices,
      ccp,
      "ca.org1.example.com"
    );

    // setup wallet to hold credentials of the application user
    const wallet = await buildWallet(Wallets, walletPath);

    // in a real application this would be done on an administrative flow, and only once
    await enrollAdmin(caClient, wallet, mspOrg1);

    // in a real application this would be done only when a new user was required to be added
    // and would be part of an administrative flow
    await registerAndEnrollUser(
      caClient,
      wallet,
      mspOrg1,
      org1UserId,
      "org1.department1"
    );

    // Create a new gateway instance for interacting with the fabric network.
    // In a real application this would be done as the backend server session is setup for
    // a user that has been verified.
    const gateway = new Gateway();

    try {
      await gateway.connect(ccp, {
        wallet,
        identity: org1UserId,
        discovery: {
          enabled: true,
          asLocalHost: true,
        },
      });

      // Build a network instance on the channel we deployed the chaincode on
      const network = await gateway.getNetwork(channelName);

      // Get the contract from the network
      const contract = network.getContract(chaincodeName);

      console.log("Printing report1");
      console.log(await getReport(contract, "report1"));

      console.log("Printing all reports");
      console.log(await getAllReports(contract));

    } finally {
      gateway.disconnect();
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

/**
 * Return all the current reports in the ledger
 * 
 * @param {*} contract 
 */
const getAllReports = async (contract) => {
  let reports = await contract.evaluateTransaction("GetAllReports");
  // Reports is returned as a Buffer, so we convert this to a json object
  let json = JSON.parse(reports.toString());

  // Change format from {Key: {}, Report: {}} to only the report object (this already includes the key)
  return json
}

/**
 * Initialize several test reports (strictly for development)
 */
const initLedger = async (contract) => {
  await contract.submitTransaction("InitLedger");
}

/**
 * Search for a single report by its ID
 * 
 * @param {*} contract 
 * @param {*} reportId 
 */
const getReport = async (contract, reportId) => {
  let report = await contract.evaluateTransaction("GetReport", reportId);
  return JSON.parse(report.toString())
}

/**
 * Create a new report 
 * 
 * @param {*} contract 
 * @param {*} reportId 
 * @param {*} ownerId 
 * @param {*} building 
 * @param {*} room 
 * @param {*} asset 
 * @param {*} type 
 * @param {*} description 
 */
const createReport = async (contract, reportId, ownerId, building, room, asset, type, description) => {
  await contract.submitTransaction("CreateReport", reportId, ownerId, building, room, asset, type, description, "submitted");
}







main();
