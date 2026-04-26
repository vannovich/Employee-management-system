import { Loader2Icon, LockIcon, X } from "lucide-react";
import React, { useRef, useState } from "react";
import api from "../api/axios";

function ChangePasswordModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const formRef = useRef(); // ✅ FIX: stable form reference

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = formRef.current; // ✅ safe reference

    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(form);
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");

    // ✅ basic validation
    if (newPassword.length < 6) {
      setLoading(false);
      return setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
    }

    try {
      const { data } = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to update password");
      }

      // ✅ success
      setMessage({
        type: "success",
        text: "Password updated successfully",
      });

      form.reset(); // ✅ no more crash

      // ✅ optional auto close
      setTimeout(() => {
        onClose();
        setMessage({ type: "", text: "" });
      }, 1200);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <LockIcon className="w-5 h-5 text-slate-400" />
            Change Password
          </h2>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5">
          {message.text && (
            <div
              className={`p-3 rounded-xl text-sm flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  message.type === "success"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />
              {message.text}
            </div>
          )}

          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              disabled={loading}
            />
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              required
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex justify-center items-center gap-2"
            >
              {loading && (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              )}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;