import * as fabric from "./fabric";

beforeAll(async () => {
  await fabric.connectGateway();
  await fabric.deleteAllReports();
});

test("get-reports-empty", async () => {
  const reports = await fabric.getAllReports();

  expect(reports).toStrictEqual([]);
});

test("new-reports", async () => {
  await fabric.initLedger();

  const reports = await fabric.getAllReports();

  expect(reports.length).toBe(2);

  expect(reports[0]).toMatchObject({
    assetId: 10,
    buildingId: 1,
    damageId: 3,
    dateCreated:
      "Fri Mar 12 2021 17:00:16 GMT+0000 (Coordinated Universal Time)",
    description: "Toilet is not flushing",
    docType: "report",
    reportId: 1,
    reporteeId: 1,
    roomId: 2,
    status: "SUBMITTED",
  });
});

test("get-report", async () => {
  const report = await fabric.getReport("1");

  expect(report).toMatchObject({
    assetId: 10,
    buildingId: 1,
    damageId: 3,
    dateCreated:
      "Fri Mar 12 2021 17:00:16 GMT+0000 (Coordinated Universal Time)",
    description: "Toilet is not flushing",
    docType: "report",
    reportId: 1,
    reporteeId: 1,
    roomId: 2,
    status: "SUBMITTED",
  });
});

test("approve-report", async () => {
  await fabric.approveReport("1", "test-approve");

  const report = await fabric.getReport("1");

  expect(report).toMatchObject({
    assetId: 10,
    buildingId: 1,
    damageId: 3,
    dateCreated:
      "Fri Mar 12 2021 17:00:16 GMT+0000 (Coordinated Universal Time)",
    description: "Toilet is not flushing",
    docType: "report",
    reportId: 1,
    reporteeId: 1,
    roomId: 2,
    status: "APPROVED",
    reason: "test-approve",
  });
});

test("deny-report", async () => {
  await fabric.denyReport("1", "test-deny", "0");

  const report = await fabric.getReport("1");

  expect(report).toMatchObject({
    assetId: 10,
    buildingId: 1,
    damageId: 3,
    dateCreated:
      "Fri Mar 12 2021 17:00:16 GMT+0000 (Coordinated Universal Time)",
    description: "Toilet is not flushing",
    docType: "report",
    reportId: 1,
    reporteeId: 1,
    roomId: 2,
    status: "DENIED",
    reason: "test-deny",
  });
});

test("view-report-history", async () => {
  const history: any = await fabric.getReportHistory("1");

  expect(history).toMatchObject({});
});
