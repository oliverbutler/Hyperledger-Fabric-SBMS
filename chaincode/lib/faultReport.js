"use strict";

const { Contract } = require("fabric-contract-api");

class FaultReport extends Contract {
  /**
   * Initialize a ledger, in this case we will have an example report from a practical Room in the USB, report of a broken PC folding mechanism
   */
  async InitLedger(ctx, reports) {

    // We have to send the parameters as strings
    let json = JSON.parse(reports);

    for (const report of json) {
      report.status = "SUBMITTED"
      await ctx.stub.putState("report_" + report.reportId, Buffer.from(JSON.stringify(report)));
      console.log(`Report ${report.ID} initialized successfully`);
    }
  }

  /**
   * @param {*} ctx
   * @param {*} id The ID of the report to read
   */
  async GetReport(ctx, id) {
    const report = await ctx.stub.getState("report_" + id); // return a fault report by a given id

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
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push({ Key: result.value.key, Record: record });
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }

  /**
   * Create report from a report object
   * 
   * @param {*} ctx 
   * @param {*} report 
   */
  async CreateReport(ctx, report) {
    report = JSON.parse(report);

    if (this.ReportExists(ctx, report.reportId)) {
      throw new Error(`The report ${id} already exists`);
    }

    ctx.stub.putState("report_" + report.reportId, Buffer.from(JSON.stringify(report)));
    return JSON.stringify(report);
  }

  /**
   * Helper to find out if a report exists on the ledger
   * @param {} ctx
   * @param {*} reportId
   */
  async ReportExists(ctx, reportId) {
    const report = await ctx.stub.getState("report_" + reportId);
    return report && report.length > 0;
  }
}

module.exports = FaultReport