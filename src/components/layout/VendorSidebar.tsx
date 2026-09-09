"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, UserCheck, PlusCircle, Menu, X } from "lucide-react";

interface VendorSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const VendorSidebar: React.FC<VendorSidebarProps> = ({ collapsed, onToggle }) => {
  const pathname = usePathname();

  const navItems = [
    { label: "Job Descriptions", href: "/vendor/jobs", icon: FileText },
    { label: "Create Job Description", href: "/vendor/jobs/new", icon: PlusCircle },
    { label: "Candidates", href: "/vendor/candidates", icon: UserCheck },
  ];

  return (
    <aside
      className={`relative bg-white/80 backdrop-blur-md rounded-[32px] p-5 border border-slate-300/60 shadow-2xs flex flex-col justify-between shrink-0 space-y-6 self-stretch transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className="space-y-6">
        {/* Header: logo + hamburger toggle */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link
              href="/vendor/jobs"
              className="flex items-center gap-2.5 px-2 py-2 rounded-full border border-slate-300/80 bg-white shadow-2xs hover:border-slate-400 transition-all overflow-hidden min-w-0 flex-1 mr-2"
            >
              <div className="w-7 h-7 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center text-xs font-black shadow-2xs shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-black tracking-tight text-slate-900 whitespace-nowrap truncate">
                Rightfit
              </span>
            </Link>
          )}

          <button
            onClick={onToggle}
            className="w-9 h-9 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsed: small logo icon */}
        {collapsed && (
          <Link
            href="/vendor/jobs"
            className="flex items-center justify-center px-1 py-1 rounded-full border border-slate-300/80 bg-white shadow-2xs hover:border-slate-400 transition-all"
            title="Rightfit"
          >
            <div className="w-7 h-7 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center text-xs font-black shadow-2xs">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </Link>
        )}

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Client Workspace
            </p>
          )}

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-extrabold transition-all duration-150 ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-[#1E1E1E] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};
