import { useState, useEffect } from "react"
import axios from "axios"

import Report from "./Components/Report"

const App = () => {

  const [reports, setReports] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:5000/reports').then((res) => {
      setReports(res.data)
    })
  }, [])

  return (
    <div className="m-4">
      <h1 className="text-3xl">All Fault Reports</h1>
      {reports && reports.map((report, index) =>
        <Report report={report} index={index} />
      )}
      <h1 className="text-3xl">Create Fault Report</h1>
      <label className="block">
        <span>Input (text)</span>
        <input type="text" className="mt-1 block w-96" placeholder="john@example.com" />
      </label>
      <label className="block">
        <span>Input (text)</span>
        <input type="text" className="mt-1 block w-96" placeholder="john@example.com" />
      </label>
    </div>
  );
}

export default App;
