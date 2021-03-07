import React, { useState, useEffect } from 'react'
import axios from "axios"

import Table from "../CustomTable"

const columns = [
  { id: 'id', numeric: true, disablePadding: true, label: 'ID' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Name' }
];

const DamageTypes = () => {

  // Table Rows
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/damages`).then(res => {
      setRows(res.data)
    })
  }, [])

  return (
    <div>
      <Table rows={rows} columns={columns} title="All Damage Types" />
    </div>
  )
}

export default DamageTypes

