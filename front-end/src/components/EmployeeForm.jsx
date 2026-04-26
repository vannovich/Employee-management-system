import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "../assets/assets";
import { Loader2Icon } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

function EmployeeForm({ initialData, onSuccess, onCancel }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ✅ FIXED: correct edit mode detection
  const isEditMode = !!initialData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Convert FormData → JSON (IMPORTANT FIX)
    const data = Object.fromEntries(formData.entries());

    // ❗ remove empty password in edit mode
    if (isEditMode && !data.password) {
      delete data.password;
    }

    // normalize numbers
    data.basicSalary = Number(data.basicSalary || 0);
    data.allowances = Number(data.allowances || 0);
    data.deductions = Number(data.deductions || 0);

    try {
      const url = isEditMode
        ? `/employees/${initialData.id}`
        : "/employees";

      const method = isEditMode ? "put" : "post";

      await api[method](url, data);

      onSuccess ? onSuccess() : navigate("/employees");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-3xl animate-fade-in"
    >
      {/* PERSONAL */}
      <div className="card p-5 sm:p-6">
        <h3 className="font-medium mb-6 pb-6 border-b border-slate-100">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">
          <input name="firstName" defaultValue={initialData?.firstName} required placeholder="First Name" />
          <input name="lastName" defaultValue={initialData?.lastName} required placeholder="Last Name" />
          <input name="phone" defaultValue={initialData?.phone} required placeholder="Phone" />

          <input
            type="date"
            name="joinDate"
            required
            defaultValue={
              initialData?.joinDate
                ? new Date(initialData.joinDate).toISOString().split("T")[0]
                : ""
            }
          />

          <textarea
            name="bio"
            defaultValue={initialData?.bio}
            placeholder="Bio (optional)"
            rows={3}
          />
        </div>
      </div>

      {/* EMPLOYMENT */}
      <div className="card p-5 sm:p-6">
        <h3 className="font-medium mb-6 pb-4 border-b border-slate-100">
          Employee Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <select name="department" defaultValue={initialData?.department || ""}>
            <option value="">Select Department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input name="position" required defaultValue={initialData?.position} />

          <input
            type="number"
            name="basicSalary"
            defaultValue={initialData?.basicSalary || 0}
            step="0.01"
          />

          <input
            type="number"
            name="allowances"
            defaultValue={initialData?.allowances || 0}
            step="0.01"
          />

          <input
            type="number"
            name="deductions"
            defaultValue={initialData?.deductions || 0}
            step="0.01"
          />

          {isEditMode && (
            <select name="employmentStatus" defaultValue={initialData?.employmentStatus || "ACTIVE"}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          )}
        </div>
      </div>

      {/* ACCOUNT */}
      <div className="card p-5 sm:p-6">
        <h3 className="font-medium mb-6 pb-4 border-b border-slate-100">
          Account Setup
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <input
            name="email"
            type="email"
            required
            defaultValue={initialData?.email}
            placeholder="Work Email"
          />

          {!isEditMode && (
            <input name="password" type="password" required placeholder="Temporary Password" />
          )}

          {isEditMode && (
            <input
              name="password"
              type="password"
              placeholder="Leave blank to keep current password"
            />
          )}

          <select name="role" defaultValue={initialData?.role || "EMPLOYEE"}>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => (onCancel ? onCancel() : navigate(-1))}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="btn-secondary flex items-center justify-center"
        >
          {loading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
          {isEditMode ? "Update Employee" : "Create Employee"}
        </button>
      </div>
    </form>
  );
}

export default EmployeeForm;