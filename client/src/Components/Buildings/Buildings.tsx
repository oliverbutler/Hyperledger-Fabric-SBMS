import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom"
import axios from "axios"

import Table from "../CustomTable"

const columns = [
  { id: 'id', numeric: true, disablePadding: true, label: 'ID' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', link: (row: any) => `/building/${row.id}` },
  { id: 'description', numeric: false, disablePadding: false, label: 'Description' }
];


const Buildings = () => {

  // Table Rows
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/buildings').then(res => {
      setRows(res.data)
    })
  }, [])

  return (
    <div>
      <Table rows={rows} columns={columns} title={"All Buildings"} />
    </div>
  )
}

export default Buildings

