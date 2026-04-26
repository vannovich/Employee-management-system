import React, { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import PaySlipList from "../components/payslip/PaySlipList";
import GeneratePaySlipForm from "../components/payslip/GeneratePaySlipForm";
import { useAuth } from "../context/useContext";
import api from "../api/axios";
import { toast } from "react-hot-toast";

function Payslip() {
  const [payslips, setPayslips] = useState([]); // ✅ default empty array
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const fetchPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/payslips");
      setPayslips(res.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees");
        const data = res.data?.data || res.data || [];
        setEmployees(data.filter((e) => !e.isDeleted));
      } catch (error) {
        toast.error(
          error?.response?.data?.error || "Failed to fetch employees"
        );
      }
    };

    fetchEmployees();
  }, [isAdmin]); // ✅ correct dependency

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">PaySlips</h1>
          <p className="page-subtitle">
            {isAdmin
              ? "Generate and manage employee payslips"
              : "Your payslip history"}
          </p>
        </div>

        {isAdmin && (
          <GeneratePaySlipForm
            employees={employees}
            onSuccess={fetchPayslips}
          />
        )}
      </div>

      <PaySlipList payslips={payslips} isAdmin={isAdmin} />
    </div>
  );
}

export default Payslip;