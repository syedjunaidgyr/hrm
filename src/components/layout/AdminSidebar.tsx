"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Send,
  BarChart3,
  ShieldAlert,
} from "lucide-react";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Vendors", href: "/admin/vendors", icon: Building2 },
    { label: "Job Descriptions", href: "/admin/jobs", icon: FileText },
    { label: "Candidate Pool", href: "/admin/candidates", icon: Users },
    { label: "Submissions", href: "/admin/submissions", icon: Send },
    { label: "Analytics & Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "System Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-md rounded-[32px] p-5 border border-slate-300/60 shadow-2xs flex flex-col justify-between shrink-0 space-y-6 self-stretch">
      <div className="space-y-6">
        {/* Crextio Outlined Pill Logo */}
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-slate-300/80 bg-white shadow-2xs hover:border-slate-400 transition-all shrink-0"
        >
          <div className="w-7 h-7 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center text-xs font-black shadow-2xs">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900">RecruitPortal</span>
        </Link>

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-150 relative ${
                    isActive
                      ? "bg-[#1E1E1E] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};
