"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Briefcase, CheckCheck, Settings, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "VENDOR";
    vendorName?: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setNotifications(data.notifications || []);
          }
        }
      } catch (err) {
        // Silent catch
      }
    };
    fetchNotifs();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network errors — still redirect
    }
    // Hard redirect so the browser reloads fully with the cleared cookie
    window.location.href = "/login";
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const adminNavItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Clients", href: "/admin/clients" },
    { label: "Jobs", href: "/admin/jobs" },
    { label: "Candidates", href: "/admin/candidates" },
    { label: "Submissions", href: "/admin/submissions" },
    { label: "Analytics", href: "/admin/reports" },
    { label: "Audit Logs", href: "/admin/audit-logs" },
  ];

  const vendorNavItems = [
    { label: "Job Descriptions", href: "/vendor/jobs" },
    { label: "Create JD", href: "/vendor/jobs/new" },
    { label: "Candidates", href: "/vendor/candidates" },
  ];

  const navItems = user.role === "ADMIN" ? adminNavItems : vendorNavItems;

  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 text-slate-900">
      {/* Search Input Bar */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
        <input
          type="text"
          placeholder="Search job description, candidate..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300/80 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-2xs"
        />
      </div>

      {/* Right Controls: Bell, User Avatar, Logout */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="w-10 h-10 rounded-full border border-slate-300/80 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all shadow-2xs relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 p-5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-100 text-rose-700 rounded-full">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-[#0C54D9] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 my-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center space-y-1">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl text-xs transition-all my-1 ${
                        notif.isRead ? "bg-white opacity-70" : "bg-blue-50/60 border border-blue-100 font-medium"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span>{notif.title}</span>
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[#0C54D9] shrink-0" />}
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Initials Avatar Circle & Role Badge */}
        <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1.5 border border-slate-300/80 shadow-2xs">
          <div
            className="w-8 h-8 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center text-xs font-black shadow-2xs"
            title={`${user.name} (${user.role})`}
          >
            {getInitials(user.name)}
          </div>
          <div className="hidden md:block text-left text-xs pr-1">
            <p className="font-extrabold text-slate-900 leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{user.role}</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full border border-slate-300/80 bg-white flex items-center justify-center text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-all shadow-2xs"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
