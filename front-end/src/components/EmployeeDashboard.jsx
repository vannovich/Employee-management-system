import { CalculatorIcon } from "lucide-react";
import React from "react";

function EmployeeDashboard({ data }) {
  const emp = data.employee;
  const cards = [
    {
      icon: CalculatorIcon,
      value: data.currentMonthAttendance,
      title: "Days Present",
      subtitle: "This month",
    },
  ];
  return <div></div>;
}

export default EmployeeDashboard;
