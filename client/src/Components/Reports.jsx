import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

// Axios
import axios from "axios"

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export const Reports = () => {
  const classes = useStyles();

  const [reports, setReports] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:5000/reports').then((res) => {
      setReports(res.data)
    })
  }, [])

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Report ID</TableCell>
            <TableCell>Reportee</TableCell>
            <TableCell>Building</TableCell>
            <TableCell>Room</TableCell>
            <TableCell>Asset</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports && reports.map((report) => (
            <TableRow key={report.ID}>
              <TableCell>{report.ID}</TableCell>
              <TableCell>{report.Owner}</TableCell>
              <TableCell>{report.Building}</TableCell>
              <TableCell>{report.Room}</TableCell>
              <TableCell>{report.Asset}</TableCell>
              <TableCell>{report.Type}</TableCell>
              <TableCell>{report.Description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}