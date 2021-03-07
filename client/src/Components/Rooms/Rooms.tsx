import React, { useState, useEffect } from 'react'
import axios from "axios"

import Table from "../CustomTable"

const columns = [
  { id: 'id', numeric: true, disablePadding: true, label: 'ID' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', link: (row: any) => `/building/${row.buildingId}/room/${row.id}` },
  { id: 'floor', numeric: false, disablePadding: false, label: 'Floor' },
  { id: 'description', numeric: false, disablePadding: false, label: 'Description' }
];

type RoomsProps = {
  buildingId: string
}

type Data = {
  name: string,
  description: string,
  rooms: any[]
}

const Rooms = ({ buildingId }: RoomsProps) => {

  // Table Rowss
  const [data, setData] = useState<Data | undefined>(undefined)

  useEffect(() => {
    axios.get(`http://localhost:5000/building/${buildingId}`).then(res => {
      setData(res.data)
    })
  }, [])

  return (
    <div>
      {data &&
        <Table rows={data.rooms} columns={columns} title={data.name} context={{ "Description": data.description }} />
      }
    </div>
  )
}

export default Rooms

