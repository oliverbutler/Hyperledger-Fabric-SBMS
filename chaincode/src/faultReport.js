"use strict";

const { Contract, Context } = require("fabric-contract-api");

/**
 * Helper function to make changing the index prefix easier globally
 * @param {number | string} reportId
 * @returns
 */
const getId = (reportId) => {
  return "report" + reportId;
};

/**
 * Helper function to make changing the index prefix easier globally
 * @param {number | string} reporteeId
 * @returns
 */
const getReporteeId = (reporteeId) => {
  return "reportee" + reporteeId;
};

class FaultReport extends Contract {
  /**
   * Initialize the ledger with several example Reports,
   * all at different stages of their report cycle.
   *
   * @param {Context} ctx
   * @returns
   */
  async InitLedger(ctx) {
    var reports = [
      {
        reportId: 1,
        reporteeId: 1,
        buildingId: 1, // usb
        roomId: 2, // unisex toilet
        assetId: 10, // a unisex toilet
        damageId: 3, // NOT_WORKING
        description: "Toilet is not flushing",
        dateCreated: new Date().toString(),
        status: "SUBMITTED",
      },
      {
        reportId: 2,
        reporteeId: 1,
        buildingId: 1, // usb
        roomId: 1, // lobby
        assetId: 12, // Window bay seats
        damageId: 1, // WATER_DAMAGE
        description: "Drink Spilled onto Sofa",
        dateCreated: new Date().toString(),
        status: "APPROVED",
        reason: "Problem fixed",
      },
    ];

    for (const report of reports) {
      await this.CreateReport(ctx, JSON.stringify(report));
      console.info(`Report ${report.reportId} Initialized`);
    }

    return JSON.stringify(reports);
  }

  /**
   * Gets all results based upon iterator, and whether to return history or not
   *
   * @param iterators
   * @param {boolean} isHistory
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
   * Returns any state by range (unlike by ID) this one would require "report1"-"report9999" not 1-9999
   *
   * @param {Context} ctx
   * @param {string} startKey
   * @param {string} endKey
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
   * @param {Context} ctx
   * @param {string} queryString
   * @returns
   */
  async QueryReports(ctx, queryString) {
    return await this.GetQueryResultForQueryString(ctx, queryString);
  }

  /**
   * Returns results based upon query string
   *
   * @param {Context} ctx
   * @param {string} queryString
   * @returns
   */
  async GetQueryResultForQueryString(ctx, queryString) {
    let resultsIterator = await ctx.stub.getQueryResult(queryString);
    let results = await this.GetAllResults(resultsIterator, false);

    return JSON.stringify(results);
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Report                                   */
  /* -------------------------------------------------------------------------- */

  /**
   * @param {Context} ctx
   * @param {string} reportId The ID of the report to read
   */
  async GetReport(ctx, reportId) {
    const report = await ctx.stub.getState(getId(reportId)); // return a fault report by a given id

    if (!report || report.length === 0) {
      throw new Error(`The report ${reportId} doesn't exist`);
    }

    return report.toString();
  }

  /**
   * Return all reports
   *
   * @param {Context} ctx
   * @returns
   */
  async GetAllReports(ctx) {
    var allReports = await this.GetReportByRange(ctx, "0", "9999999999");
    return allReports;
  }

  /**
   * Create report from a report object
   *
   * @param {Context} ctx
   * @param {string} report
   */
  async CreateReport(ctx, report) {
    let parsed = JSON.parse(report);
    if (await this.ReportExists(ctx, parsed.reportId)) {
      throw new Error(`The report ${parsed.reportId} already exists`);
    }

    parsed.docType = "report";

    // Save asset to state
    ctx.stub.putState(
      getId(parsed.reportId),
      Buffer.from(JSON.stringify(parsed))
    );

    // Create compomposite key and store index entry to state
    const indexName = "asset~name";
    const assetNameIndexKey = ctx.stub.createCompositeKey(indexName, [
      parsed.assetId.toString(),
      parsed.reportId.toString(),
    ]);

    await ctx.stub.putState(assetNameIndexKey, Buffer.from("\u0000"));

    return JSON.stringify(parsed);
  }

  /**
   * Delete a report and the asset~name from the ledger
   * @param {Context} ctx
   * @param {string} reportId
   */
  async DeleteReport(ctx, reportId) {
    if (!(await this.ReportExists(ctx, reportId))) {
      throw new Error(`Report ${reportId} does not exist`);
    }

    let reportBuffer = await ctx.stub.getState(getId(reportId));

    if (!reportBuffer || !reportBuffer.toString()) {
      throw new Error(`Asset does not exist (get buffer): ${id}`);
    }

    let report = JSON.parse(reportBuffer.toString());

    await ctx.stub.deleteState(getId(reportId));
    console.info(`Deleted report${reportId}`);

    let indexName = "asset~name";
    const assetNameIndexKey = ctx.stub.createCompositeKey(indexName, [
      report.assetId.toString(),
      report.reportId.toString(),
    ]);

    if (!assetNameIndexKey) {
      throw new Error(`Failed to create composite key for report${reportId}`);
    }

    await ctx.stub.deleteState(assetNameIndexKey);
    console.info(
      `Deleted report${reportId}'s composite key ${assetNameIndexKey}`
    );
  }

  /**
   * Helper to find out if a report exists on the ledger
   * @param {Context} ctx
   * @param {string} reportId
   */
  async ReportExists(ctx, reportId) {
    const report = await ctx.stub.getState(getId(reportId));
    return report && report.length > 0;
  }

  /**
   * Return reports between ID ranges
   *
   * @param {Context} ctx
   * @param {string} startId
   * @param {string} endId
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
   * Return the history of a Report since it was created
   *
   * @param {Context} ctx
   * @param {string} reportId
   * @returns
   */
  async GetReportHistory(ctx, reportId) {
    let iterator = await ctx.stub.getHistoryForKey(getId(reportId));
    let results = await this.GetAllResults(iterator, true);

    return JSON.stringify(results);
  }

  /**
   * Approve a report, taking a reason
   *
   * @param {Context} ctx
   * @param {string} reportId
   * @param {string} reason
   * @returns
   */
  async ApproveReport(ctx, reportId, reason) {
    let reportBuffer = await this.GetReport(ctx, reportId);

    if (!reportBuffer || !reportBuffer.toString()) {
      throw new Error(`Report ${reportId} doesn't exist`);
    }

    let report = {};

    try {
      report = JSON.parse(reportBuffer.toString());
    } catch (err) {
      throw new Error(`Failed to decode JSON of ${reportId}`);
    }

    report.status = "APPROVED";
    report.reason = reason;

    // Now we have approved the report lets either update or
    // create this reportees ledger asset

    try {
      await this.CreateReportee(ctx, report.reporteeId);
    } catch (err) {
      console.info(`Reportee ${report.reporteeId} already exists!`);
    }

    // Update the score of the reportee, in this case, with a delta of +1
    await this.UpdateScore(ctx, report.reporteeId, 1);

    // Update the report on the ledger
    await ctx.stub.putState(
      getId(reportId),
      Buffer.from(JSON.stringify(report))
    );
  }

  /**
   * Deny a report, with a reason and whether or not to deduct points
   *
   * @param {Context} ctx
   * @param {string} reportId
   * @param {string} reason
   * @param {string} deductPoints
   */
  async DenyReport(ctx, reportId, reason, deductPoints) {
    let reportBuffer = await this.GetReport(ctx, reportId);

    if (!reportBuffer || !reportBuffer.toString()) {
      throw new Error(`Report ${reportId} doesn't exist`);
    }

    let report = {};

    try {
      report = JSON.parse(reportBuffer.toString());
    } catch (err) {
      throw new Error(`Failed to decode JSON of ${reportId}`);
    }

    report.status = "DENIED";
    report.reason = reason;

    // If we choose to deduct points, otherwise do nothing
    if (deductPoints) {
      // Now we have deny the report lets either update or
      // create this reportees ledger asset
      try {
        await this.CreateReportee(ctx, report.reporteeId);
      } catch (err) {
        console.info(`Reportee ${report.reporteeId} already exists!`);
      }

      // Update the score of the reportee, in this case, with a delta of +1
      await this.UpdateScore(ctx, report.reporteeId, -1);
    }

    await ctx.stub.putState(
      getId(reportId),
      Buffer.from(JSON.stringify(report))
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Reportee                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Create a reportee given their reporteeId
   *
   * @param {Context} ctx
   * @param {string} reporteeId
   */
  async CreateReportee(ctx, reporteeId) {
    if (await this.ReporteeExists(ctx, reporteeId)) {
      throw new Error(`Reportee ${reporteeId} already exists`);
    }

    const reportee = {
      docType: "reportee",
      reporteeId,
      score: 0,
    };

    ctx.stub.putState(
      getReporteeId(reporteeId),
      Buffer.from(JSON.stringify(reportee))
    );

    return JSON.stringify(reportee);
  }

  /**
   * Return all reportees
   *
   * @param {Context} ctx
   */
  async GetAllReportees(ctx) {
    const allReportees = await this.GetReporteesByRange(ctx, "0", "9999999999");
    return allReportees;
  }

  /**
   * Returns reportees between two ID ranges
   *
   * @param {Context} ctx
   * @param {string} startId
   * @param {string} endId
   * @returns
   */
  async GetReporteesByRange(ctx, startId, endId) {
    let resultsIterator = await ctx.stub.getStateByRange(
      getReporteeId(startId),
      getReporteeId(endId)
    );
    let results = await this.GetAllResults(resultsIterator, false);

    return JSON.stringify(results);
  }

  /**
   * Return a reportee via their reporteeId
   * @param {Context} ctx
   * @param {string} reporteeId
   */
  async GetReportee(ctx, reporteeId) {
    const reportee = await ctx.stub.getState(getReporteeId(reporteeId));

    if (!reportee || reportee.length === 0) {
      throw new Error(`The reportee ${reportId} doesn't exist`);
    }

    return reportee.toString();
  }

  /**
   *  Returns the history of a Reportee since its creation
   *
   * @param {Context} ctx
   * @param {string} reporteeid
   */
  async GetReporteeHistory(ctx, reporteeid) {
    let iterator = await ctx.stub.getHistoryForKey(getReporteeId(reporteeid));
    let results = await this.GetAllResults(iterator, true);

    return JSON.stringify(results);
  }

  /**
   * Updates the score of a user
   *
   * - if the user doesnt exist, create them
   * - score starts at 0
   *
   * @param {Context} ctx
   * @param {string} reporteeId
   * @param {string} delta
   */
  async UpdateScore(ctx, reporteeId, delta, reportId) {
    if (!(await this.ReportExists(ctx, reportId))) {
      throw new Error("Referenced report doesn't exist");
    }

    try {
      parseInt(delta);
    } catch (err) {
      throw new Error("delta must be an integer");
    }

    let reporteeBuffer = await this.GetReportee(ctx, reporteeId);

    if (!reporteeBuffer || !reporteeBuffer.toString()) {
      throw new Error(`Reportee ${reporteeId} doesn't exist`);
    }

    let reportee = {};

    try {
      reportee = JSON.parse(reporteeBuffer.toString());
    } catch (err) {
      throw new Error(`Failed to decode JSON of ${getReporteeId(reporteeId)}`);
    }

    reportee.score += parseInt(delta);
    reportee.scoreDelta = parseInt(delta); // store the delta alongside to see in history
    reportee.reportReferenceId = reporteeId; // store the reference alongside to see in history

    await ctx.stub.putState(
      getReporteeId(reporteeId),
      Buffer.from(JSON.stringify(reportee))
    );
  }

  /**
   * Check whether a reportee exists or not via their reporteeId
   *
   * @param {Context} ctx
   * @param {string} reporteeId
   */
  async ReporteeExists(ctx, reporteeId) {
    const reportee = await ctx.stub.getState(getReporteeId(reporteeId));
    return reportee && reportee.length > 0;
  }
}

module.exports = FaultReport;
