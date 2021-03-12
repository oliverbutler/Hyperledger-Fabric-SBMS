import React, { useState, useEffect } from "react";
import axios from "axios";

import { Box, Paper, Typography } from "@material-ui/core";

type UserProps = {
  userId: number;
};

const User = ({ userId }: UserProps) => {
  const [history, setHistory] = useState();

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
          <pre>{JSON.stringify(history, null, 2)}</pre>
        </Box>
      </Paper>
    </div>
  );
};

export default User;
