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

const channelName = "mychannel";
const chaincodeName = "basic";
const mspOrg1 = "Org1MSP";
const walletPath = path.join(__dirname, "wallet");
const org1UserId = "appUser";

function prettyJSONString(inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}

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

      console.log(`Initializing Ledger...`);
      await contract.submitTransaction("InitLedger");

      console.log(`Print first one...`);
      let report = await contract.evaluateTransaction("ReadAsset", "report1");
      console.log(`Result ${prettyJSONString(report.toString())}`);
    } finally {
      gateway.disconnect();
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

main();
