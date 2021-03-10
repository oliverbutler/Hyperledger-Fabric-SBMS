"use strict";

const { Contract } = require("fabric-contract-api");

class FaultReport extends Contract {
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
    const iterator = await ctx.stub.getStateByRange("report_0", "report_99999999");
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
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

    if (await this.ReportExists(ctx, report.reportId)) {
      throw new Error(`The report ${report.reportId} already exists`);
    }

    ctx.stub.putState(
      "report_" + report.reportId,
      Buffer.from(JSON.stringify(report))
    );
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

module.exports = FaultReport;
