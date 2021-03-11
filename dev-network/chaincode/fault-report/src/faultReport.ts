"use strict";

import { Contract, Context, Info, Transaction } from "fabric-contract-api";

interface Report {
  docType?: "report";
  reportId: number;
  reporteeId: number;
  buildingId: number;
  roomId: number;
  assetId: number;
  damageId: number;
  description: string;
  dateCreated: string;
  status: string;
  dateUpdateStatus?: string;
  statusReason?: string;
}

/**
 * Helper function to make changing the index prefix easier globally
 * @param reportId
 * @returns
 */
const getId = (reportId: number) => {
  return "report" + reportId;
};

@Info({
  title: "FaultReport",
  description: "Smart Contract for reporting faults in a smart building",
})
export class FaultReport extends Contract {
  /**
   * @param {*} ctx
   * @param {*} id The ID of the report to read
   */
  @Transaction(false)
  async GetReport(ctx: Context, reportId: number) {
    const report = await ctx.stub.getState(getId(reportId)); // return a fault report by a given id

    if (!report || report.length === 0) {
      throw new Error(`The report ${reportId} doesn't exist`);
    }

    return report.toString();
  }

  /**
   * Gets all results based upon iterator, and whether to return history or not
   * @param iterator
   * @param isHistory
   * @returns
   */
  @Transaction(false)
  async GetAllResults(iterator: any, isHistory: boolean) {
    let allResults = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        let jsonRes: any = {};
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
  @Transaction()
  async CreateReport(ctx: Context, report: Report) {
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
  @Transaction(false)
  async ReportExists(ctx: Context, reportId: number) {
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
  @Transaction(false)
  async GetReportByRange(ctx: Context, startId: number, endId: number) {
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
  @Transaction(false)
  async GetStateByRange(ctx: Context, startKey: string, endKey: string) {
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
  @Transaction(false)
  async QueryReports(ctx: Context, queryString: string) {
    return await this.GetQueryResultForQueryString(ctx, queryString);
  }

  /**
   * Returns results based upon query string
   *
   * @param ctx
   * @param queryString
   * @returns
   */
  @Transaction(false)
  async GetQueryResultForQueryString(ctx: Context, queryString: string) {
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
  @Transaction(false)
  async GetAssetHistory(ctx: Context, reportId: number) {
    let resultsIterator = await ctx.stub.getHistoryForKey(getId(reportId));
    let results = await this.GetAllResults(resultsIterator, true);

    return JSON.stringify(results);
  }

  @Transaction()
  async ApproveReport(ctx: Context, reportId: number, reason: string) {
    let reportString = await this.GetReport(ctx, reportId);

    return reportString;
  }
}
