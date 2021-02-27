"use strict";

const { Contract } = require("fabric-contract-api");

class FaultReport extends Contract {
  /**
   * Initialize a ledger, in this case we will have an example report from a practical Room in the USB, report of a broken PC folding mechanism
   */
  async InitLedger(ctx) {
    const reports = [
      {
        ID: "report1",
        Owner: "b00001",
        Building: "usb",
        Room: "3.005",
        Asset: "12",
        Type: "damage",
        Description: "Broken PC folding mechanism",
        Status: "submitted",
      },
      {
        ID: "report2",
        Owner: "b00002",
        Building: "usb",
        Room: "3.018",
        Asset: "115",
        Type: "refill",
        Description: "Empty hand sanitizer",
        Status: "fixed",
      },
    ];

    for (const report of reports) {
      report.docType = "report";
      await ctx.stub.putState(report.ID, Buffer.from(JSON.stringify(report)));
      console.log(`Report ${report.ID} initialized successfully`);
    }
  }

  /**
   * @param {*} ctx
   * @param {*} id The ID of the report to read
   */
  async GetReport(ctx, id) {
    const report = await ctx.stub.getState(id); // return a fault report by a given id

    if (!report || report.length === 0) {
      throw new Error(`The report ${id} doesn't exist`);
    }

    return report.toString();
  }

  /**
   * Returns all reports on the ledger,   
   * 
   * @param {*} ctx 
   */
  async GetAllReports(ctx) {
    const allResults = [];

    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();

    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString("utf8");

      let record;

      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }

      allResults.push({ Key: result.value.key, Record: record });
    }

  }

  /**
   * Create a new report, taking the appropriate parameters
   * @param {*} ctx
   * @param {*} ID
   * @param {*} Owner
   * @param {*} Building
   * @param {*} Room
   * @param {*} Asset
   * @param {*} Type
   * @param {*} Description
   * @param {*} Status
   */
  async CreateReport(
    ctx,
    ID,
    Owner,
    Building,
    Room,
    Asset,
    Type,
    Description,
    Status
  ) {
    const report = {
      ID,
      Owner,
      Building,
      Room,
      Asset,
      Type,
      Description,
      Status,
    };
    ctx.stub.putState(ID, Buffer.from(JSON.stringify(report)));
    return JSON.stringify(report);
  }

  /**
   * Helper to find out if a report exists on the ledger
   * @param {} ctx
   * @param {*} ID
   */
  async ReportExists(ctx, ID) {
    const report = await ctx.stub.getState(ID);
    return report && report.length > 0;
  }
}

module.exports = FaultReport