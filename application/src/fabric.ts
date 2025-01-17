import { Contract, Gateway, GatewayOptions } from "fabric-network";
import * as path from "path";
import { buildCCPOrg1, buildWallet } from "./utils/AppUtil";
import {
  buildCAClient,
  enrollAdmin,
  registerAndEnrollUser,
} from "./utils/CAUtil";

const channelName = "mychannel";
const chaincodeName = "basic";
const mspOrg1 = "Org1MSP";
const walletPath = path.join(__dirname, "wallet");
const org1UserId = "appUser1";

const _ = require("lodash");

let gateway: Gateway;

// Contract object we call to perform operations/transactions on the chaincode
let contract: Contract;

export const connectGateway = async () => {
  try {
    const ccp = buildCCPOrg1();

    const caClient = buildCAClient(ccp, "ca.org1.example.com");

    const wallet = await buildWallet(walletPath);

    await enrollAdmin(caClient, wallet, mspOrg1);

    await registerAndEnrollUser(
      caClient,
      wallet,
      mspOrg1,
      org1UserId,
      "org1.department1"
    );

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
};

export const disconnect = () => {
  gateway.disconnect();
};

/**
 * Interface for a report, decreases the likelihood of typing errors and improves the intellisense capabilities
 *
 * We use ID's rather than the raw data so we can make changes to names of buildings, rooms, descriptions
 * whatnot within our traditional DB, and the changes will be reflected globally without a ledger rewrite
 */
export interface Report {
  reportId: number;
  reporteeId: number;
  buildingId: number;
  roomId: number;
  assetId: number;
  damageId: number;
  description: string;
  status?: string;
  reason?: string;
  dateCreated?: string;
  dateUpdated?: string;
}

/**
 * Return all the current reports in the ledger
 */
export const getAllReports = async (): Promise<Report[]> => {
  let reports = await contract.evaluateTransaction("GetAllReports");

  // Reports is returned as a Buffer, so we convert this to a json object
  let json = JSON.parse(reports.toString());
  // Change format from {Key: {}, Report: {}} to only the report object (this already includes the key)
  return _.map(json, "Record");
};

/**
 * Search for a single report by its ID
 *
 * @param {*} reportId
 */
export const getReport = async (reportId: string): Promise<Report> => {
  let report = await contract.evaluateTransaction("GetReport", reportId);
  return JSON.parse(report.toString());
};

/**
 * Search for a single report's history by its ID
 *
 * @param {*} reportId
 */
export const getReportHistory = async (reportId: string): Promise<Report> => {
  let report = await contract.evaluateTransaction("GetReportHistory", reportId);
  return JSON.parse(report.toString());
};

/**
 * Create a new report and add it to the ledger via the smart contract
 *
 * @param report
 */
export const createReport = async (report: Report) => {
  var datetime = Date();

  report.status = "SUBMITTED";
  report.dateCreated = datetime.toString();
  await contract.submitTransaction("CreateReport", JSON.stringify(report));
};

/**
 * Check if report exists
 */
export const reportExists = async (id: string) => {
  const report = await contract.evaluateTransaction("ReportExists", id);
  return JSON.parse(report.toString());
};

export const initLedger = async () => {
  await contract.submitTransaction("InitLedger");
};

/* -------------------------------------------------------------------------- */
/*                                   Report                                   */
/* -------------------------------------------------------------------------- */

export const getAllReportees = async () => {
  const reportees = await contract.evaluateTransaction("GetAllReportees");
  return JSON.parse(reportees.toString());
};

export const getReporteeHistory = async (reporteeId: string) => {
  const reportee = await contract.evaluateTransaction(
    "GetReporteeHistory",
    reporteeId
  );
  return JSON.parse(reportee.toString());
};

/**
 * For each report in the ledger, delete it
 */
export const deleteAllReports = async () => {
  const reports = await getAllReports();

  console.log("Delete all Reports");

  reports.forEach(async (r) => {
    await contract.submitTransaction("DeleteReport", String(r.reportId));
  });

  return true;
};

export const approveReport = async (reportId: string, reason: string) => {
  const report = await getReport(reportId);

  try {
    await contract.submitTransaction(
      "CreateReportee",
      report.reporteeId.toString()
    );
  } catch (err) {
    console.info("Reportee already exists...");
  }

  await contract.submitTransaction("ApproveReport", reportId, reason);
};

export const denyReport = async (
  reportId: string,
  reason: string,
  deduct: string
) => {
  const report = await getReport(reportId);

  try {
    await contract.submitTransaction(
      "CreateReportee",
      report.reporteeId.toString()
    );
  } catch (err) {
    console.info("Reportee already exists...");
  }

  await contract.submitTransaction("DenyReport", reportId, reason, deduct);
};
