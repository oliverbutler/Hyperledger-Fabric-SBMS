import React, { useState, useEffect } from "react";
import axios from "axios";

import { Link } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import CustomTable from "../../CustomTable";

type ReportProps = {
  reportId: number;
};

const columns = [
  {
    id: "date",
    numeric: true,
    disablePadding: true,
    label: "date",
    render: (row: any) => {
      var d = new Date(0);
      d.setUTCSeconds(row.Timestamp.seconds);
      return d.toLocaleString();
    },
  },
  {
    id: "status",
    numeric: false,
    disablePadding: true,
    label: "Status",
    render: (row: any) => <Chip label={row.Value.status} color="secondary" />,
  },
  {
    id: "Value.reason",
    numeric: false,
    disablePadding: true,
    label: "Reason",
  },
];

const Report = ({ reportId }: ReportProps) => {
  const [report, setReport] = useState<any>(null);
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/report/${reportId}`).then((res) => {
      setReport(res.data);
    });
    axios
      .get(`http://localhost:5000/report/${reportId}/history`)
      .then((res) => {
        setHistory(res.data);
      });
  }, []);

  const handleApprove = () => {
    setLoading(true);
    axios
      .post(`http://localhost:5000/report/${reportId}/approve`, {
        reason: reason,
      })
      .then((res) => {
        setLoading(false);
      });
  };

  const handleDeny = () => {
    setLoading(true);
    axios
      .post(`http://localhost:5000/report/${reportId}/deny`, {
        reason: reason,
        deduct: "",
      })
      .then((res) => {
        setLoading(false);
      });
  };

  const handleFraudulent = () => {
    setLoading(true);
    axios
      .post(`http://localhost:5000/report/${reportId}/deny`, {
        reason: reason,
        deduct: "true",
      })
      .then((res) => {
        setLoading(false);
      });
  };

  return (
    <div>
      <Typography variant="h4">Report {reportId}</Typography>
      {report && (
        <Paper>
          <Box p={2} my={2}>
            <Box mb={1}>
              <Typography variant="h6">Reportee</Typography>
              <Box display="flex" flexDirection="row">
                <Box mr={2}>
                  <Avatar
                    alt={report.reportee.givenName + " profile picture"}
                    src={report.reportee.picture}
                  >
                    {report.reportee.givenName.charAt(0) +
                      report.reportee.familyName.charAt(0)}
                  </Avatar>
                </Box>
                <Box>
                  <Typography>ID: {report.reportee.id}</Typography>
                  <Typography>
                    Name: {report.reportee.givenName}{" "}
                    {report.reportee.familyName}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box mb={1}>
              <Typography variant="h6">Asset</Typography>
              <Typography>
                {report.building.name} &gt; {report.room.name} &gt;{" "}
                {report.asset.name}({report.asset.description}){" "}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="h6">Problem</Typography>
              <Chip label={report.damage.name} color="primary" />
              <Typography>{report.description}</Typography>
            </Box>

            <Box mb={1}>
              <Typography variant="h6">Status</Typography>
              <Chip label={report.status} color="secondary" />
              {report.reason && <Typography>{report.reason}</Typography>}
            </Box>
            <Box>
              <Typography variant="h6">Submitted</Typography>
              {report.dateCreated}
            </Box>
          </Box>
        </Paper>
      )}
      <Paper>
        <Box p={2} my={2}>
          <Typography variant="h6">Update the report status</Typography>
          <Box mt={2}>
            <FormControl>
              <TextField
                label="Reason"
                multiline
                rows={4}
                rowsMax={10}
                variant="outlined"
                onChange={(e) => setReason(e.target.value)}
                value={reason}
              />
              <FormHelperText>
                Reason for decision, the number in brackets is what will happen
                to the reportees score on the ledger
              </FormHelperText>
            </FormControl>
          </Box>
          <Box mt={2} display="flex" flexDirection="row">
            <Box mr={1}>
              <Button
                variant="contained"
                color="primary"
                disabled={!reason || loading}
                onClick={handleApprove}
              >
                Approve Report (+1)
              </Button>
            </Box>
            <Box mr={1}>
              <Button
                variant="contained"
                color="default"
                disabled={!reason || loading}
                onClick={handleDeny}
              >
                Deny Report (0)
              </Button>
            </Box>
            <Box>
              <Button
                variant="contained"
                color="secondary"
                disabled={!reason || loading}
                onClick={handleFraudulent}
              >
                Mark as fraudulent (-1)
              </Button>
            </Box>
          </Box>
          {loading && <CircularProgress />}
        </Box>
      </Paper>
      <CustomTable rows={history} columns={columns} title="Report History" />
      {/* <Paper>
        <Box p={2} my={2}>
          <Typography variant="h6">Report Ledger History</Typography>
          {history &&
            history.map((h) => {
              var d = new Date(0);
              d.setUTCSeconds(h.Timestamp.seconds);
              return (
                <Box mb={1}>
                  <Typography variant="h6">{d.toDateString()}</Typography>
                  c
                  {report.reason && <Typography>{report.reason}</Typography>}
                </Box>
              );
            })}
          <pre>{JSON.stringify(history, null, 2)}</pre>
        </Box>
      </Paper> */}
    </div>
  );
};

export default Report;
