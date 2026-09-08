import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/db";
import { vendors, jobDescriptions, candidates, candidateSubmissions } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import {
  Building2,
  FileText,
  Users,
  Send,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  ArrowUpRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { ScheduleWidget } from "@/components/dashboard/ScheduleWidget";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  // Aggregate stats using SQL count
  const [
    totalVendors,
    activeVendors,
    totalJobs,
    submittedJobs,
    closedJobs,
    totalCandidates,
    totalSubmissions,
    pendingFeedback,
    shortlistedCount,
    selectedCount,
    rejectedCount,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(vendors).then((res) => Number(res[0]?.count || 0)),
    db.select({ count: sql<number>`count(*)` }).from(vendors).where(eq(vendors.status, "ACTIVE")).then((res) => Number(res[0]?.count || 0)),
    db.select({ count: sql<number>`count(*)` }).from(jobDescriptions).then((res) => Number(res[0]?.count || 0)),
    db.select({ count: sql<number>`count(*)` }).from(jobDescriptions).where(eq(jobDescriptions.status, "SUBMITTED")).then((res) => Number(res[0]?.count || 0)),
    db.select({ count: sql<number>`count(*)` }).from(jobDescriptions).where(eq(jobDescriptions.status, "CLOSED")).then((res) => Number(res[0]?.count || 0)),
    db.select({ count: sql<number>`count(*)` }).from(candidates).then((res) => Number(res[0]?.count || 0)),
    db.select({ count: sql<number>`count(*)` }).from(candidateSubmissions).then((res) => Number(res[0]?.count || 0)),
    db.select({ count: sql<number>`count(*)` }).from(candidateSubmissions).where(eq(candidateSubmissions.status, "FEEDBACK_PENDING")).then((res) => Number(res[0]?.count || 0)),
    db.select({ count: sql<number>`count(*)` }).from(candidateSubmissions).where(eq(candidateSubmissions.status, "SHORTLISTED")).then((res) => Number(res[0]?.count || 0)),
    db.select({ count: sql<number>`count(*)` }).from(candidateSubmissions).where(eq(candidateSubmissions.status, "SELECTED")).then((res) => Number(res[0]?.count || 0)),
    db.select({ count: sql<number>`count(*)` }).from(candidateSubmissions).where(eq(candidateSubmissions.status, "REJECTED")).then((res) => Number(res[0]?.count || 0)),
  ]);

  // Fetch Vendor Performance summary list
  const vendorPerformanceList = await db.query.vendors.findMany({
    with: {
      jobDescriptions: true,
      submissions: {
        with: { candidate: true },
      },
    },
  });

  const recentSubmissions = await db.query.candidateSubmissions.findMany({
    orderBy: [desc(candidateSubmissions.createdAt)],
    limit: 5,
    with: {
      candidate: true,
      job: true,
    },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Crextio Greeting & KPI Overview Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-light text-[#1A1A1A] tracking-tight">
              Hello <span className="font-extrabold">{user.name}</span>
            </h2>

            {/* Inline KPI Progress Pills Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="bg-[#1E1E1E] text-white rounded-full px-5 py-2.5 text-xs font-extrabold shadow-2xs flex items-center gap-2">
                <span>Active Vendors</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-black">{activeVendors}</span>
              </div>

              <div className="bg-[#FDD868] text-slate-900 rounded-full px-5 py-2.5 text-xs font-black shadow-2xs flex items-center gap-2">
                <span>Selected & Placed</span>
                <span className="px-2 py-0.5 rounded-full bg-black/10 text-slate-900 font-extrabold">{selectedCount}</span>
              </div>

              <div className="border border-slate-300/80 bg-white text-slate-800 rounded-full px-5 py-2.5 text-xs font-extrabold shadow-2xs flex items-center gap-2">
                <span>Submitted JDs</span>
                <span className="font-black text-[#1A1A1A]">{submittedJobs}</span>
              </div>

              <div className="border border-slate-300/80 bg-white text-slate-800 rounded-full px-5 py-2.5 text-xs font-extrabold shadow-2xs flex items-center gap-2">
                <span>Shortlisted</span>
                <span className="font-black text-[#1A1A1A]">{shortlistedCount}</span>
              </div>
            </div>
          </div>

          {/* Big Numerical Counters */}
          <div className="flex items-center gap-8 bg-white/80 rounded-full px-8 py-4 border border-slate-200/80 shadow-2xs shrink-0">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-0.5">
                <Building2 className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Vendors</span>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">{totalVendors}</span>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-0.5">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Candidates</span>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">{totalCandidates}</span>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-0.5">
                <Briefcase className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Jobs</span>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">{totalJobs}</span>
            </div>
          </div>
        </div>

        {/* Crextio 3-Column Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols): Schedule & Recent Timeline Widget */}
          <div className="lg:col-span-4 space-y-6">
            <ScheduleWidget
              title="Recruitment Schedule"
              role="ADMIN"
              viewAllHref="/admin/candidates"
            />
          </div>

          {/* Middle Column (5 cols): Submissions & Candidates Data Table Widget */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FAF9F5] rounded-[32px] p-6 border border-slate-200/60 shadow-2xs space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold text-[#1A1A1A]">Recent Submissions</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 w-32 sm:w-40"
                    />
                  </div>
                  <Link
                    href="/admin/submissions"
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Table List */}
              <div className="divide-y divide-slate-200/60 bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                {recentSubmissions.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs font-semibold">
                    No submissions recorded yet.
                  </div>
                ) : (
                  recentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {sub.candidate.name.charAt(0)}
                        </div>
                        <div>
                          <Link
                            href={`/admin/candidates/${sub.candidate.id}`}
                            className="text-xs font-extrabold text-slate-900 hover:underline block"
                          >
                            {sub.candidate.name}
                          </Link>
                          <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
                            {sub.candidate.currentDesignation || "Candidate"} • {sub.candidate.totalExperience} yrs
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono font-bold text-slate-600 hidden sm:inline">
                          {sub.job.jobCode}
                        </span>
                        <Badge status={sub.status}>{sub.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Vendor List Widget */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-200/60 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#1A1A1A]">Vendor Partners Performance</h3>
                <Link href="/admin/vendors" className="text-xs font-bold text-[#0C54D9] hover:underline">
                  View All ({vendorPerformanceList.length}) →
                </Link>
              </div>

              <div className="space-y-2">
                {vendorPerformanceList.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900">{v.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {v.jobDescriptions.length} JDs • {v.submissions.length} Candidate Submissions
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (3 cols): Dark Attendance & Analytics Report Card */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#1E1E1E] text-white rounded-[32px] p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold tracking-tight text-white">Submission Analytics</h4>
                <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-white">{selectedCount}</span>
                  <span className="text-emerald-400 font-bold text-sm">↗ {shortlistedCount}</span>
                  <span className="text-slate-400 font-bold text-sm">↘</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Shortlisted & Selected Rate</p>
              </div>

              {/* Crextio Dot Matrix Activity Heatmap */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Activity Matrix</p>
                <div className="grid grid-cols-7 gap-2 py-2">
                  {[...Array(21)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full mx-auto ${
                        i % 3 === 0
                          ? "bg-[#FDD868] shadow-xs"
                          : i % 2 === 0
                          ? "bg-white/40"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Employee Composition Donut Widget */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Pipeline Composition</p>
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                  <div className="w-16 h-16 rounded-full border-4 border-[#FDD868] border-t-white flex items-center justify-center text-center">
                    <span className="text-xs font-black text-white">{totalSubmissions}</span>
                  </div>
                  <div className="space-y-1 text-right text-xs">
                    <p className="font-bold text-white">● 70% Qualified</p>
                    <p className="font-medium text-slate-400">● 30% In Review</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
