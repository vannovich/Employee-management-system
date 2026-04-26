import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Payslip from "./pages/Payslip";
import Leave from "./pages/Leave";
import Attendance from "./pages/Attendance";
import Employees from "./pages/Employees";
import PrintPaySlip from "./pages/PrintPaySlip";
import LoginForm from "./components/LoginForm";
function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/login/admin"
          element={
            <LoginForm
              role="ADMIN"
              title="Admin Portal"
              subtitle="Sign in to manage the organization"
            />
          }
        />

        <Route
          path="/login/employee"
          element={
            <LoginForm
              role="EMPLOYEE"
              title="Employee Portal"
              subtitle="Sign in to access your account"
            />
          }
        />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/payslips" element={<Payslip />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/print/payslips/:id" element={<PrintPaySlip />} />

        <Route path="/*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

export default App;
