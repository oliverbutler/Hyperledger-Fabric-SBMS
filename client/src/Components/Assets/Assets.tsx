import React, { useState, useEffect } from 'react'
import axios from "axios"

import Table from "../CustomTable"

const columns = [
  { id: 'id', numeric: true, disablePadding: true, label: 'ID' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
  { id: 'roomId', numeric: false, disablePadding: false, label: "Room ID" },
  { id: 'type.name', numeric: false, disablePadding: false, label: 'Type' },
  { id: 'description', numeric: false, disablePadding: false, label: 'Description' }
];

const Assets = () => {

  // Table Rows
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/Assets`).then(res => {
      setRows(res.data)
    })
  }, [])

  return (
    <div>
      <Table rows={rows} columns={columns} title="All Assets" />
    </div>
  )
}

export default Assets

