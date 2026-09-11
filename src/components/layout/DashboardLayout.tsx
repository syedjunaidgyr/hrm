"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { AdminSidebar } from "./AdminSidebar";
import { VendorSidebar } from "./VendorSidebar";
import { SessionUser } from "@/lib/auth/session";

interface DashboardLayoutProps {
  user: SessionUser;
  vendorName?: string;
  children: React.ReactNode;
  /** Hide left sidebar (used on client JD landing). */
  hideSidebar?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  vendorName,
  children,
  hideSidebar = false,
}) => {
  const isAdmin = user.role === "ADMIN";
  const isVendor = user.role === "VENDOR";

  const storageKey = isAdmin ? "admin_sidebar_collapsed" : "vendor_sidebar_collapsed";

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, [storageKey]);

  const handleDesktopToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(storageKey, String(next));
  };

  const handleMobileClose = () => setMobileOpen(false);

  const desktopSidebarProps = {
    collapsed,
    onToggle: handleDesktopToggle,
  };

  const showSidebar = (isAdmin || isVendor) && !hideSidebar;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3ED] text-[#1A1A1A] p-3 sm:p-5 lg:p-6 font-sans">
      <div className="flex-1 min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3rem)] bg-[#FAF9F5] rounded-[36px] border border-slate-300/50 p-4 sm:p-6 lg:p-8 shadow-xl w-full flex flex-col md:flex-row items-stretch gap-8 relative overflow-hidden">

        {/* ── Mobile overlay backdrop ── */}
        {mobileOpen && showSidebar && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Mobile hamburger button (visible only on small screens, when sidebar is closed) ── */}
        {showSidebar && !mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden fixed top-6 left-6 z-40 w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            aria-label="Open sidebar"
          >
            {/* Hamburger lines */}
            <span className="flex flex-col gap-1">
              <span className="block w-4 h-0.5 bg-current rounded-full" />
              <span className="block w-4 h-0.5 bg-current rounded-full" />
              <span className="block w-4 h-0.5 bg-current rounded-full" />
            </span>
          </button>
        )}

        {/* ── Desktop sidebar (always in flow) ── */}
        {showSidebar && (
          <div className="hidden md:flex">
            {isAdmin && <AdminSidebar {...desktopSidebarProps} />}
            {isVendor && <VendorSidebar {...desktopSidebarProps} />}
          </div>
        )}

        {/* ── Mobile sidebar (slides in as fixed overlay) ── */}
        {showSidebar && (
          <div
            className={`md:hidden fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{ padding: "0.75rem" }}
          >
            {isAdmin && (
              <AdminSidebar
                collapsed={false}
                onToggle={handleMobileClose}
              />
            )}
            {isVendor && (
              <VendorSidebar
                collapsed={false}
                onToggle={handleMobileClose}
              />
            )}
          </div>
        )}

        {/* ── Main content ── */}
        <div className="flex-1 space-y-6 w-full min-w-0 flex flex-col">
          <Navbar user={{ name: user.name, email: user.email, role: user.role, vendorName }} />
          <main className="w-full flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
};
