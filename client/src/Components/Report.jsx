import { useState, useEffect } from "react"

const Label = ({ label, content, type, status }) => {

  const [c, setC] = useState("")

  useEffect(() => {

    var classString = "rounded-md pl-1 pr-1 "

    if (status) {
      switch (content) {
        case "submitted":
          classString += "bg-yellow-100";
          break;
        case "fixed":
          classString += "bg-green-100";
          break;
        default:
          classString += "bg-grey-200";
          break;
      }

      setC(classString)
    }
  }, [content, status])

  return (<div className="flex flex-row ">
    <p className="font-bold mr-2">{label}:</p>
    <p className={c}>{content}</p>
  </div>)
}

const Report = ({ report }) => {
  return (
    <div className="bg-gray-100  hover:bg-gray-200 rounded-md flex flex-col m-2 p-2 ">
      <div className="">
        <Label label="ID" content={report.ID} />
        <Label label="Status" content={report.Status} status />
        <Label label="Owner" content={report.Owner} />
        <Label label="Location" content={report.Building + " > " + report.Room + " > " + report.Asset} />
        <Label label="Type" content={report.Type} type />
      </div>
      <div className="text-3xl flex flex-row pt-2">
        <div className="hover:text-green-400">
          <ion-icon name="checkmark-outline"></ion-icon>
        </div>
        <div className="hover:text-red-400">
          <ion-icon name="close-outline"></ion-icon>
        </div>
      </div>
    </div>
  )
}

export default Report
