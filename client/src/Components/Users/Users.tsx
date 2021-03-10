import React, { useState, useEffect } from "react";
import axios from "axios";

import Table from "../CustomTable";
import { Avatar } from "@material-ui/core";

const columns = [
  { id: "id", numeric: true, disablePadding: true, label: "ID" },
  { id: "userCode", numeric: false, disablePadding: false, label: "User Code" },
  {
    id: "givenName",
    numeric: false,
    disablePadding: false,
    label: "First Name",
  },
  {
    id: "familyName",
    numeric: false,
    disablePadding: false,
    label: "Last Name",
  },
  {
    id: "picture",
    disableSort: true,
    render: (value: any) => (
      <Avatar alt={value.givenName + " profile picture"} src={value.picture}>
        {value.givenName.charAt(0) + value.familyName.charAt(0)}
      </Avatar>
    ),
    label: "Picture",
  },
];

const Users = () => {
  // Table Rows
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/users`).then((res) => {
      setRows(res.data);
    });
  }, []);

  return (
    <div>
      <Table rows={rows} columns={columns} title="All Users" />
    </div>
  );
};

export default Users;
