import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarIcon,
  ChevronRightIcon,
  DollarSignIcon,
  FileTextIcon,
  LayoutDashboard,
  Loader2,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useAuth } from "../context/useContext";
import api from "../api/axios";

function Sidebar() {
  const { pathname } = useLocation();
  const [userName, setUserName] = useState("Admin");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, loading, logout } = useAuth();
  const role = user?.role;

  // ✅ FIXED: actually fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        const data = res.data?.data || res.data;

        if (data?.firstName) {
          setUserName(`${data.firstName} ${data.lastName || ""}`.trim());
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    fetchProfile();
  }, []);

  // ✅ FIXED: close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    role === "ADMIN"
      ? { name: "Employees", href: "/employees", icon: UserIcon }
      : { name: "Attendance", href: "/attendance", icon: CalendarIcon },
    { name: "Leave", href: "/leave", icon: FileTextIcon },
    { name: "PaySlips", href: "/payslips", icon: DollarSignIcon },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <UserIcon className="text-white size-7" />
            <div>
              <p className="font-semibold text-[13px] text-white">
                Employee MS
              </p>
              <p className="text-[11px] text-slate-500">Management System</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <XIcon />
          </button>
        </div>
      </div>

      {/* Profile */}
      {userName && (
        <div className="mx-3 mt-4 mb-1 p-3 rounded-lg bg-white/3 border border-white/4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-slate-400 text-xs font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[13px] font-medium text-slate-200 truncate">
                {userName}
              </p>
              <p className="text-[11px] text-slate-500">
                {role === "ADMIN" ? "Administrator" : "Employee"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] uppercase text-slate-500">Navigation</p>
      </div>

      <div className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-3 flex items-center gap-2 text-slate-500">
            <Loader2 className="animate-spin w-4 h-4" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
                  isActive
                    ? "bg-indigo-500/12 text-indigo-300"
                    : "text-slate-300 hover:text-white hover:bg-white/4"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRightIcon className="w-3.5 h-3.5" />}
              </Link>
            );
          })
        )}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-white/6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:text-rose-400"
        >
          <LogOutIcon className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((s) => !s)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg"
      >
        <MenuIcon size={20} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-slate-900 text-white">
        {sidebarContent}
      </aside>

      {/* Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-slate-900 z-50 transform transition ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default Sidebar;
