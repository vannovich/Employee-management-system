import React, { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import CheckInButton from "../components/attendance/CheckInButton";
import AttendanceStats from "../components/attendance/AttendanceStats";
import AttendanceHistory from "../components/attendance/AttendanceHistory";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Attendance() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/attendance");
      const json = res.data;

      setHistory(json.data || []);

      // ⚠️ Only works if backend sends this (otherwise remove)
      if (json.employee?.isDeleted) {
        setIsDeleted(true);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to load",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX: actually fetch data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Loading />;

  // ✅ FIX: proper date comparison
  const today = new Date().toDateString();

  const todayRecord = history.find(
    (r) => new Date(r.date).toDateString() === today,
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">
          Track your work hours and daily check-ins
        </p>
      </div>

      {isDeleted ? (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
          <p className="text-rose-600">
            You can no longer clock in or out because your employee record has
            been deactivated.
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <CheckInButton todayRecord={todayRecord} onAction={fetchData} />
        </div>
      )}

      <AttendanceStats history={history} />
      <AttendanceHistory history={history} />
    </div>
  );
}
