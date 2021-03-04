import React, { useState, useEffect } from 'react'
import axios from "axios"
import camelcaseKeys from "camelcase-keys"

import ReportsTable from "../CustomTable"

const headCells = [
  { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
  { id: 'owner', numeric: false, disablePadding: false, label: 'Owner' },
  { id: 'building', numeric: false, disablePadding: false, label: 'Building' },
  { id: 'room', numeric: false, disablePadding: false, label: 'Room' },
  { id: 'asset', numeric: false, disablePadding: false, label: 'Asset' },
];

const Reports = () => {

  // Table Rows
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/reports').then(res => {
      console.log(camelcaseKeys(res.data))
      setRows(camelcaseKeys(res.data))
    })
  }, [])

  return (
    <div>
      <ReportsTable rows={rows} headCells={headCells} />
    </div>
  )
}

export default Reports

