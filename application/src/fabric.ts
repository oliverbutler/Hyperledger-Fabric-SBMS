"use strict";

const { Gateway, Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const path = require("path");
const {
  buildCAClient,
  registerAndEnrollUser,
  enrollAdmin,
} = require("../../fabric-samples/test-application/javascript/CAUtil.js");
const {
  buildCCPOrg1,
  buildWallet,
} = require("../../fabric-samples/test-application/javascript/AppUtil.js");
const { report } = require("process");

const channelName = "mychannel";
const chaincodeName = "basic";
const mspOrg1 = "Org1MSP";
const walletPath = path.join(__dirname, "wallet");
const org1UserId = "appUser";

const _ = require('lodash')


// Create a new gateway instance for interacting with the fabric network.
// In a real application this would be done as the backend server session is setup for
// a user that has been verified.
const gateway = new Gateway();

// Contract object we call to perform operations/transactions on the chaincode
let contract;

export const connectGateway = async () => {
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
    contract = network.getContract(chaincodeName);

    return contract;

  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

export const disconnect = () => {
  gateway.disconnect();
}

/**
 * Interface for a report, decreases the likelihood of typing errors and improves the intellisense capabilities
 */
interface Report {
  reportId: string;
  ownerId: string;
  building: string;
  room: string;
  asset: string;
  type: string;
  description: string;
  status?: string;
}

/**
 * Return all the current reports in the ledger
 */
export const getAllReports = async (): Promise<Report[]> => {
  let reports = await contract.evaluateTransaction("GetAllReports");
  // Reports is returned as a Buffer, so we convert this to a json object
  let json = JSON.parse(reports.toString());

  // Change format from {Key: {}, Report: {}} to only the report object (this already includes the key)
  return _.map(json, "Report");
}

/**
 * Initialize several test reports (strictly for development)
 */
export const initLedger = async () => {
  await contract.submitTransaction("InitLedger");
}

/**
 * Search for a single report by its ID
 * 
 * @param {*} reportId 
 */
export const getReport = async (reportId: string): Promise<Report> => {
  let report = await contract.evaluateTransaction("GetReport", reportId);
  return JSON.parse(report.toString())
}

/**
 * Create a new report and add it to the ledger via the smart contract
 * 
 * @param report 
 */
export const createReport = async (report: Report) => {
  await contract.submitTransaction("CreateReport", report.reportId, report.ownerId, report.building, report.room, report.asset, report.type, report.description, "submitted");
}

