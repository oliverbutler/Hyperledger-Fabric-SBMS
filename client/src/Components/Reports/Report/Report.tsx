import React, { useState, useEffect } from "react";
import axios from "axios";

import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";

type ReportProps = {
  reportId: number;
};

const Report = ({ reportId }: ReportProps) => {
  const [report, setReport] = useState({});

  useEffect(() => {
    axios.get(`http://localhost:5000/report/${reportId}`).then((res) => {
      setReport(res.data);
    });
  }, []);

  return (
    <div>
      <Typography variant="h4">Report {reportId}</Typography>
      <pre>{JSON.stringify(report, null, 2)}</pre>
    </div>
  );
};

export default Report;
