import React, { useState, useEffect } from 'react'
import axios from "axios"

import Table from "../../CustomTable"

const columns = [
  { id: 'id', numeric: true, disablePadding: true, label: 'ID' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
  { id: 'type.name', numeric: false, disablePadding: false, label: 'Type' },
  { id: 'description', numeric: false, disablePadding: false, label: 'Description' }
];

type RoomsProps = {
  buildingId: string,
  roomId: string
}

type Data = {
  name: string,
  floor: string,
  description: string,
  building: any,
  assets: any[]
}

const Assets = ({ buildingId, roomId }: RoomsProps) => {

  // Table Rows
  const [data, setData] = useState<Data | undefined>(undefined);

  useEffect(() => {
    axios.get(`http://localhost:5000/building/${buildingId}/room/${roomId}`).then(res => {
      setData(res.data)
    })
  }, [])

  return (
    <div>
      {data && <Table rows={data.assets} columns={columns} title={data.name} context={{ "Building": data.building.name, "Floor": data.floor, "Description": data.description }} />}
    </div>
  )
}

export default Assets

