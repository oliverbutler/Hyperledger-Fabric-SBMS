import { Gateway, GatewayOptions } from 'fabric-network';
import * as path from 'path';
import { buildCCPOrg1, buildWallet } from './utils/AppUtil';
import { buildCAClient, enrollAdmin, registerAndEnrollUser } from './utils/CAUtil';

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser1';

const _ = require('lodash')

let gateway;

// Contract object we call to perform operations/transactions on the chaincode
let contract;

export const connectGateway = async () => {
  try {
    const ccp = buildCCPOrg1();

    const caClient = buildCAClient(ccp, 'ca.org1.example.com');

    const wallet = await buildWallet(walletPath);

    await enrollAdmin(caClient, wallet, mspOrg1);

    await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

    gateway = new Gateway();

    const gatewayOpts: GatewayOptions = {
      wallet,
      identity: org1UserId,
      discovery: { enabled: true, asLocalhost: true }, // using asLocalhost as this gateway is using a fabric network deployed locally
    };

    await gateway.connect(ccp, gatewayOpts);

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

