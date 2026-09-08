import React from "react";
import { Navbar } from "./Navbar";
import { AdminSidebar } from "./AdminSidebar";
import { VendorSidebar } from "./VendorSidebar";
import { SessionUser } from "@/lib/auth/session";

interface DashboardLayoutProps {
  user: SessionUser;
  vendorName?: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, vendorName, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3ED] text-[#1A1A1A] p-3 sm:p-5 lg:p-6 font-sans">
      <div className="flex-1 min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3rem)] bg-[#FAF9F5] rounded-[36px] border border-slate-300/50 p-4 sm:p-6 lg:p-8 shadow-xl w-full flex flex-col md:flex-row items-stretch gap-8">
        {user.role === "ADMIN" ? <AdminSidebar /> : <VendorSidebar />}
        <div className="flex-1 space-y-6 w-full min-w-0 flex flex-col">
          <Navbar user={{ name: user.name, email: user.email, role: user.role, vendorName }} />
          <main className="w-full flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
};
