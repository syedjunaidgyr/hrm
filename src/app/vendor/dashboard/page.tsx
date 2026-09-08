import React from "react";
import { requireVendor } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/db";
import { jobDescriptions, candidateSubmissions, vendors } from "@/db/schema";
import { sql, eq, and } from "drizzle-orm";
import { FileText, Users, CheckCircle2, Clock, Plus, ArrowRight, Sparkles, UserCheck, ArrowUpRight, Search, Briefcase } from "lucide-react";
import Link from "next/link";
import { ResumePreviewModal } from "@/components/ui/ResumePreviewModal";
import { ScheduleWidget } from "@/components/dashboard/ScheduleWidget";

export default async function VendorDashboardPage() {
  const user = await requireVendor();
  const vendorId = user.vendorId!;

  // Fetch Vendor Details
  const vendor = await db.query.vendors.findFirst({
    where: eq(vendors.id, vendorId),
  });

  // Query-level Vendor Isolated Aggregate Metrics
  const [
    totalJobs,
    draftJobs,
    submittedJobs,
    totalCandidates,
    pendingFeedbackCount,
    shortlistedCount,
    selectedCount,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(jobDescriptions)
      .where(eq(jobDescriptions.vendorId, vendorId))
      .then((res) => Number(res[0]?.count || 0)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(jobDescriptions)
      .where(and(eq(jobDescriptions.vendorId, vendorId), eq(jobDescriptions.status, "DRAFT")))
      .then((res) => Number(res[0]?.count || 0)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(jobDescriptions)
      .where(and(eq(jobDescriptions.vendorId, vendorId), eq(jobDescriptions.status, "SUBMITTED")))
      .then((res) => Number(res[0]?.count || 0)),
    db
      .select({ count: sql<number>`count(distinct ${candidateSubmissions.candidateId})` })
      .from(candidateSubmissions)
      .innerJoin(jobDescriptions, eq(candidateSubmissions.jobId, jobDescriptions.id))
      .where(eq(jobDescriptions.vendorId, vendorId))
      .then((res) => Number(res[0]?.count || 0)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(candidateSubmissions)
      .innerJoin(jobDescriptions, eq(candidateSubmissions.jobId, jobDescriptions.id))
      .where(
        and(
          eq(jobDescriptions.vendorId, vendorId),
          eq(candidateSubmissions.status, "FEEDBACK_PENDING")
        )
      )
      .then((res) => Number(res[0]?.count || 0)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(candidateSubmissions)
      .innerJoin(jobDescriptions, eq(candidateSubmissions.jobId, jobDescriptions.id))
      .where(
        and(
          eq(jobDescriptions.vendorId, vendorId),
          eq(candidateSubmissions.status, "SHORTLISTED")
        )
      )
      .then((res) => Number(res[0]?.count || 0)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(candidateSubmissions)
      .innerJoin(jobDescriptions, eq(candidateSubmissions.jobId, jobDescriptions.id))
      .where(
        and(
          eq(jobDescriptions.vendorId, vendorId),
          eq(candidateSubmissions.status, "SELECTED")
        )
      )
      .then((res) => Number(res[0]?.count || 0)),
  ]);

  // Fetch recent candidate submissions for this vendor's jobs
  const recentSubmissions = await db.query.candidateSubmissions.findMany({
    where: (sub, { exists }) =>
      exists(
        db
          .select()
          .from(jobDescriptions)
          .where(
            and(
              eq(jobDescriptions.id, sub.jobId),
              eq(jobDescriptions.vendorId, vendorId)
            )
          )
      ),
    limit: 5,
    orderBy: (tb, { desc }) => [desc(tb.createdAt)],
    with: {
      job: true,
      candidate: true,
      resumeFile: true,
    },
  });

  return (
    <DashboardLayout user={user} vendorName={vendor?.name}>
      <div className="space-y-8">
        {/* Crextio Greeting & Overview Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-light text-[#1A1A1A] tracking-tight">
              Hello <span className="font-extrabold">{vendor?.name || user.name}</span>
            </h2>

            {/* Inline KPI Progress Pills Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="bg-[#1E1E1E] text-white rounded-full px-5 py-2.5 text-xs font-extrabold shadow-2xs flex items-center gap-2">
                <span>Published JDs</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-black">{totalJobs}</span>
              </div>

              <div className="bg-[#FDD868] text-slate-900 rounded-full px-5 py-2.5 text-xs font-black shadow-2xs flex items-center gap-2">
                <span>Candidates Placed</span>
                <span className="px-2 py-0.5 rounded-full bg-black/10 text-slate-900 font-extrabold">{selectedCount}</span>
              </div>

              <div className="border border-slate-300/80 bg-white text-slate-800 rounded-full px-5 py-2.5 text-xs font-extrabold shadow-2xs flex items-center gap-2">
                <span>Shortlisted</span>
                <span className="font-black text-[#1A1A1A]">{shortlistedCount}</span>
              </div>

              <div className="border border-slate-300/80 bg-white text-slate-800 rounded-full px-5 py-2.5 text-xs font-extrabold shadow-2xs flex items-center gap-2">
                <span>Pending Feedback</span>
                <span className="font-black text-rose-600">{pendingFeedbackCount}</span>
              </div>
            </div>
          </div>

          {/* Big Numerical Counters & Action Button */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6 bg-white/80 rounded-full px-6 py-3.5 border border-slate-200/80 shadow-2xs shrink-0">
              <div className="text-center">
                <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Candidates</p>
                <span className="text-2xl font-black text-[#1A1A1A]">{totalCandidates}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-[10px] font-extrabold uppercase text-slate-400">Active JDs</p>
                <span className="text-2xl font-black text-[#1A1A1A]">{submittedJobs}</span>
              </div>
            </div>

            <Link
              href="/vendor/jobs/new"
              className="px-6 py-3.5 rounded-full bg-[#1E1E1E] hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> Create New JD
            </Link>
          </div>
        </div>

        {/* Crextio 3-Column Vendor Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols): Schedule & Recent Timeline Widget */}
          <div className="lg:col-span-4 space-y-6">
            <ScheduleWidget
              title="Evaluation Schedule"
              role="VENDOR"
              viewAllHref="/vendor/candidates"
            />
          </div>

          {/* Middle Column (5 cols): Candidates Table Widget */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FAF9F5] rounded-[32px] p-6 border border-slate-200/60 shadow-2xs space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold text-[#1A1A1A]">Submitted Candidates</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search candidate..."
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 w-32 sm:w-40"
                    />
                  </div>
                  <Link
                    href="/vendor/candidates"
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Candidates List */}
              <div className="divide-y divide-slate-200/60 bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                {recentSubmissions.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs font-semibold">
                    No candidates submitted yet.
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
                            href={`/vendor/candidates/${sub.candidate.id}`}
                            className="text-xs font-extrabold text-slate-900 hover:underline block"
                          >
                            {sub.candidate.name}
                          </Link>
                          <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
                            {sub.candidate.currentDesignation || "Candidate"} • {sub.candidate.totalExperience} yrs
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge status={sub.status}>{sub.status}</Badge>
                        {sub.resumeFile && (
                          <ResumePreviewModal
                            fileId={sub.resumeFile.id}
                            fileName={sub.resumeFile.fileName}
                            candidateName={sub.candidate.name}
                            triggerVariant="link"
                            triggerLabel=""
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column (3 cols): Dark Analytics Report Card */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#1E1E1E] text-white rounded-[32px] p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold tracking-tight text-white">Evaluation Report</h4>
                <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-[#FFFFFF]">{selectedCount}</span>
                  <span className="text-emerald-400 font-bold text-sm">↗ {shortlistedCount}</span>
                  <span className="text-slate-400 font-bold text-sm">↘</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Shortlisted & Selected Candidates</p>
              </div>

              {/* Crextio Dot Matrix Activity Matrix */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Evaluation Matrix</p>
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

              {/* Pipeline Donut Composition Widget */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Candidate Pipeline</p>
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                  <div className="w-16 h-16 rounded-full border-4 border-[#FDD868] border-t-white flex items-center justify-center text-center">
                    <span className="text-xs font-black text-white">{totalCandidates}</span>
                  </div>
                  <div className="space-y-1 text-right text-xs">
                    <p className="font-bold text-white">● 70% Shortlisted</p>
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
