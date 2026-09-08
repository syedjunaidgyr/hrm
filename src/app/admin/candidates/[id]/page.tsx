import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getCandidateById } from "@/services/candidate.service";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Clock,
  Star,
  Briefcase,
  FileText,
  CheckCircle2,
  Building2,
  Calendar,
  UserCheck,
  MapPin,
  DollarSign,
  Award,
} from "lucide-react";

import { ResumePreviewModal } from "@/components/ui/ResumePreviewModal";

export default async function AdminCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id: candidateId } = await params;

  const cand = await getCandidateById(candidateId);
  const primaryResume = cand.files[0];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/candidates"
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{cand.name}</h2>
                <span className="px-2.5 py-0.5 text-xs font-extrabold bg-brand-100 text-brand-800 rounded-md">
                  {cand.totalExperience} Yrs Experience
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{cand.email}</span>
                <span>•</span>
                <span>{cand.phone}</span>
                <span>•</span>
                <span>Created {new Date(cand.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {primaryResume && (
            <ResumePreviewModal
              fileId={primaryResume.id}
              fileName={primaryResume.fileName}
              candidateName={cand.name}
              triggerLabel="View Resume PDF / Document"
              triggerVariant="primary"
            />
          )}
        </div>

        {/* Master Profile & Recruitment Journey Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Master Candidate Profile Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader title="Master Candidate Profile" />
              <div className="space-y-4 text-xs text-slate-700">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Experience</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm">
                    {cand.totalExperience} Yrs Total <span className="text-slate-500 font-normal">({cand.relevantExperience} Yrs Relevant)</span>
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Current Role & Company</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm">
                    {cand.currentDesignation || "N/A"}
                  </p>
                  <p className="text-slate-600 font-medium">{cand.currentCompany || "N/A"}</p>
                </div>

                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Locations</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    Current: <strong className="text-slate-800">{cand.currentLocation || "N/A"}</strong>
                  </p>
                  <p className="text-slate-600">
                    Preferred: <strong className="text-slate-800">{cand.preferredLocation || "N/A"}</strong>
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Technical Skills</p>
                  <p className="font-semibold text-brand-700 bg-brand-50 p-2.5 rounded-lg border border-brand-200 mt-1 leading-relaxed">
                    {cand.skills}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Notice Period</p>
                    <p className="font-bold text-slate-900 mt-0.5">{cand.noticePeriod || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Expected Salary</p>
                    <p className="font-bold text-emerald-700 mt-0.5">{cand.expectedSalary ? `$${cand.expectedSalary}` : "N/A"}</p>
                  </div>
                </div>

                {cand.notes && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Recruiter Notes</p>
                    <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                      "{cand.notes}"
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Total Submissions Summary */}
            <Card className="bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-extrabold tracking-wider">Submissions Overview</p>
                  <h4 className="text-3xl font-extrabold text-white mt-1">{cand.submissions.length}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Active Vendor Job Submissions</p>
                </div>
                <Briefcase className="w-10 h-10 text-blue-400 opacity-80" />
              </div>
            </Card>
          </div>

          {/* Right Column: Complete Recruitment Journey & Submissions Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Recruitment Journey & Status Timeline" />

              {cand.submissions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold">Candidate has not been submitted to any jobs yet.</p>
                  <p className="text-xs text-slate-400">Go to any Job Description page to submit this candidate with their resume.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {cand.submissions.map((sub, index) => (
                    <div
                      key={sub.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5"
                    >
                      {/* Submission Header Banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                              {sub.job.jobCode}
                            </span>
                            <Link
                              href={`/admin/jobs/${sub.job.id}`}
                              className="font-extrabold text-slate-900 hover:text-[#0C54D9] hover:underline text-base"
                            >
                              {sub.job.title}
                            </Link>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span>Vendor: <strong className="text-slate-800">{sub.job.vendor?.name}</strong></span>
                            <span>•</span>
                            <span>Submitted: {new Date(sub.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge status={sub.status}>{sub.status}</Badge>
                          <Link
                            href={`/admin/submissions/${sub.id}`}
                            className="text-xs font-bold text-slate-700 hover:text-[#0C54D9] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                          >
                            View Submission →
                          </Link>
                        </div>
                      </div>

                      {/* Recruitment Status Timeline */}
                      <div>
                        <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#0C54D9]" />
                          Recruitment Status Transition Journey
                        </h5>

                        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 pl-1">
                          {sub.statusHistoryList.map((sh) => (
                            <div key={sh.id} className="flex items-start gap-3 relative z-10 text-xs">
                              <div className="w-7 h-7 rounded-full bg-[#0C54D9] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                                ✓
                              </div>
                              <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                                <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-slate-900">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <Badge status={sh.fromStatus}>{sh.fromStatus}</Badge>
                                    <span className="text-slate-400">→</span>
                                    <Badge status={sh.toStatus}>{sh.toStatus}</Badge>
                                  </div>
                                  <span className="text-slate-400 text-[10px] font-normal">
                                    {new Date(sh.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                {sh.user && (
                                  <p className="text-[11px] text-slate-500 font-medium">
                                    Updated by: <strong className="text-slate-700">{sh.user.name}</strong> ({sh.user.role})
                                  </p>
                                )}
                                {sh.reason && (
                                  <p className="text-slate-700 text-xs mt-1 bg-white p-2 rounded-lg border border-slate-100">
                                    {sh.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Vendor Feedback History Section */}
                      {sub.feedbackList.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            Vendor Evaluation & Feedback History
                          </h5>
                          <div className="space-y-2">
                            {sub.feedbackList.map((fb) => (
                              <div key={fb.id} className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs space-y-1">
                                <div className="flex items-center justify-between font-bold">
                                  <span className="text-purple-900">
                                    Rating: <strong className="text-purple-700">{fb.overallRating}/5</strong>
                                  </span>
                                  <Badge variant="purple">{fb.recommendation}</Badge>
                                </div>
                                {fb.comments && <p className="text-slate-700 italic font-medium">"{fb.comments}"</p>}
                                <p className="text-[10px] text-slate-400 pt-1">
                                  By {fb.author?.name || "Vendor"} • {new Date(fb.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
