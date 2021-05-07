import React, { useState, useEffect } from "react";
import axios from "axios";

import { Box, Paper, Typography } from "@material-ui/core";
import CustomTable from "../../CustomTable";

type UserProps = {
  userId: number;
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
    id: "Value.score",
    numeric: false,
    disablePadding: true,
    label: "Score",
  },
  {
    id: "Value.scoreDelta",
    numeric: false,
    disablePadding: true,
    label: "Score Delta",
  },
  {
    id: "Value.reportReferenceId",
    numeric: false,
    disablePadding: true,
    label: "Report Reference",
    link: (val: any) => `/report/${val.Value.reportReferenceId}`,
  },
];

const User = ({ userId }: UserProps) => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/user/${userId}/history`).then((res) => {
      setHistory(res.data);
    });
  }, []);

  return (
    <div>
      <Typography variant="h4">User {userId}</Typography>
      <Paper>
        <Box p={2} my={2}>
          <Typography variant="h6">User Score History</Typography>
          <Typography>score: score</Typography>
          <Typography>
            scoreDelta: the difference in score from the last transaction (e.g.
            1, 0, -1)
          </Typography>
          <Typography>
            reportReferenceId: the fault report which affected the users score
          </Typography>
          {/* <pre>{JSON.stringify(history, null, 2)}</pre> */}
        </Box>
      </Paper>
      <CustomTable rows={history} columns={columns} title="User History" />
    </div>
  );
};

export default User;
