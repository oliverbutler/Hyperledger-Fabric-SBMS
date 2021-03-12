"use strict";

const { Contract } = require('fabric-contract-api')

/**
 * Helper function to make changing the index prefix easier globally
 * @param reportId
 * @returns
 */
const getId = (reportId) => {
  return "report" + reportId;
};

class FaultReport extends Contract {
  /**
   * @param {*} ctx
   * @param {*} id The ID of the report to read
   */
  async GetReport(ctx, reportId) {
    const report = await ctx.stub.getState(getId(reportId)); // return a fault report by a given id

    if (!report || report.length === 0) {
      throw new Error(`The report ${reportId} doesn't exist`);
    }

    return report.toString();
  }

  async GetAllReports(ctx) {
    return await this.GetReportByRange(ctx, "0", "9999999999")
  }

  /**
   * Gets all results based upon iterator, and whether to return history or not
   * 
   * @param iterators
   * @param isHistory
   * @returns
   */
  async GetAllResults(iterator, isHistory) {
    let allResults = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString("utf8"));
        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString("utf8");
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString("utf8");
          }
        }
        allResults.push(jsonRes);
      }
      res = await iterator.next();
    }
    iterator.close();
    return allResults;
  }

  /**
   * Create report from a report object
   *
   * @param {*} ctx
   * @param {*} report
   */
  async CreateReport(ctx, report) {
    if (await this.ReportExists(ctx, report.reportId)) {
      throw new Error(`The report ${report.reportId} already exists`);
    }

    report.docType = "report";

    // Save asset to state
    ctx.stub.putState(
      getId(report.reportId),
      Buffer.from(JSON.stringify(report))
    );

    // Create compomposite key and store index entry to state
    const indexName = "asset~name";
    const assetNameIndexKey = ctx.stub.createCompositeKey(indexName, [
      report.assetId.toString(),
      report.reportId.toString(),
    ]);

    await ctx.stub.putState(assetNameIndexKey, Buffer.from("\u0000"));

    return JSON.stringify(report);
  }

  /**
   * Helper to find out if a report exists on the ledger
   * @param {} ctx
   * @param {*} reportId
   */
  async ReportExists(ctx, reportId) {
    const report = await ctx.stub.getState(getId(reportId));
    return report && report.length > 0;
  }

  /**
   * Return reports between ID ranges
   *
   * @param ctx
   * @param startId
   * @param endId
   * @returns
   */
  async GetReportByRange(ctx, startId, endId) {
    let resultsIterator = await ctx.stub.getStateByRange(
      getId(startId),
      getId(endId)
    );
    let results = await this.GetAllResults(resultsIterator, false);

    return JSON.stringify(results);
  }

  /**
   * Returns any state by range (unlike by ID) this one would require "report1"-"report9999" not 1-9999
   *
   * @param ctx
   * @param startKey
   * @param endKey
   * @returns
   */
  async GetStateByRange(ctx, startKey, endKey) {
    let resultsIterator = await ctx.stub.getStateByRange(startKey, endKey);
    let results = await this.GetAllResults(resultsIterator, false);

    return JSON.stringify(results);
  }

  /**
   * Query reports by query string
   *
   * @param ctx
   * @param queryString
   * @returns
   */
  async QueryReports(ctx, queryString) {
    return await this.GetQueryResultForQueryString(ctx, queryString);
  }

  /**
   * Returns results based upon query string
   *
   * @param ctx
   * @param queryString
   * @returns
   */
  async GetQueryResultForQueryString(ctx, queryString) {
    let resultsIterator = await ctx.stub.getQueryResult(queryString);
    let results = await this.GetAllResults(resultsIterator, false);

    return JSON.stringify(results);
  }

  /**
   * Return the history of a Report since it was created
   *
   * @param ctx
   * @param reportId
   * @returns
   */
  async GetAssetHistory(ctx, reportId) {
    let resultsIterator = await ctx.stub.getHistoryForKey(getId(reportId));
    let results = await this.GetAllResults(resultsIterator, true);

    return JSON.stringify(results);
  }

  async ApproveReport(ctx, reportId, reason) {
    let reportString = await this.GetReport(ctx, reportId);

    return reportString;
  }
}
module.exports = FaultReport