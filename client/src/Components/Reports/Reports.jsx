import React, { useState, useEffect } from "react";
import axios from "axios";

import { Avatar } from "@material-ui/core";

import ReportsTable from "../CustomTable";
import { Link } from "react-router-dom";

const columns = [
  {
    id: "id",
    numeric: true,
    disablePadding: true,
    label: "ID",
    link: (row) => `/report/${row.id}`,
  },
  {
    id: "reportee",
    disableSort: true,
    label: "Reportee",
    render: (value) => (
      <Avatar
        alt={value.reportee.givenName + " profile picture"}
        src={value.reportee.picture}
      >
        {value.reportee.givenName.charAt(0) +
          value.reportee.familyName.charAt(0)}
      </Avatar>
    ),
  },
  {
    id: "building.name",
    numeric: false,
    disablePadding: false,
    label: "Building",
    link: (row) => `/building/${row.building.id}`,
  },
  {
    id: "room.name",
    numeric: false,
    disablePadding: false,
    label: "Room",
    link: (row) => `/building/${row.building.id}/room/${row.room.id}`,
  },
  { id: "asset.name", numeric: false, disablePadding: false, label: "Asset" },
  {
    id: "asset.description",
    numeric: false,
    disablePadding: false,
    label: "Asset Description",
  },
  { id: "damage.name", numeric: false, disablePadding: false, label: "Damage" },
  {
    id: "description",
    numeric: false,
    disablePadding: false,
    label: "Description",
  },
  { id: "status", numeric: false, disablePadding: false, label: "Status" },
  {
    id: "dateCreated",
    numeric: false,
    disablePadding: false,
    label: "Date Created",
  },
];

const Reports = () => {
  // Table Rows
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/reports").then((res) => {
      setRows(res.data);
    });
  }, []);

  return (
    <div>
      <ReportsTable rows={rows} columns={columns} title="All Fault Reports" />
    </div>
  );
};

export default Reports;
