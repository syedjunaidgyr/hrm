import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getSubmissionById } from "@/services/submission.service";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Download, ArrowLeft, Star, Clock, UserCheck, MessageSquare, History } from "lucide-react";

import { ResumePreviewModal } from "@/components/ui/ResumePreviewModal";

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id: submissionId } = await params;

  const sub = await getSubmissionById(submissionId, user.role);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/submissions"
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {sub.candidate.name}
                </h2>
                <Badge status={sub.status}>{sub.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted for Job: <strong className="text-slate-800">{sub.job.title}</strong> ({sub.job.jobCode}) • Vendor: <strong className="text-slate-800">{sub.vendor.name}</strong>
              </p>
            </div>
          </div>

          {sub.resumeFile && (
            <ResumePreviewModal
              fileId={sub.resumeFile.id}
              fileName={sub.resumeFile.fileName}
              candidateName={sub.candidate.name}
              triggerLabel="View Candidate Resume"
              triggerVariant="primary"
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate Profile Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader title="Candidate Information" />
              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Email</p>
                  <p className="font-bold text-slate-900 mt-0.5">{sub.candidate.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Phone</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{sub.candidate.phone}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Current Role & Company</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {sub.candidate.currentDesignation || "N/A"} at {sub.candidate.currentCompany || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Experience</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {sub.candidate.totalExperience} Yrs Total ({sub.candidate.relevantExperience} Yrs Relevant)
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Locations</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    Current: {sub.candidate.currentLocation || "N/A"} | Preferred: {sub.candidate.preferredLocation || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Skills</p>
                  <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded-md border border-slate-100 mt-0.5">
                    {sub.candidate.skills}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-slate-400 font-semibold uppercase">Notice Period</p>
                    <p className="font-bold text-slate-900">{sub.candidate.noticePeriod || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase">Expected Salary</p>
                    <p className="font-bold text-slate-900">{sub.candidate.expectedSalary ? `$${sub.candidate.expectedSalary}` : "N/A"}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Feedback & Activity Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor Feedback Section */}
            <Card>
              <CardHeader title="Vendor Structured Feedback History" />
              {sub.feedbackList.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No vendor feedback submitted yet.</p>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100">
                  {sub.feedbackList.map((fb) => (
                    <div key={fb.id} className="pt-3 first:pt-0 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{fb.author?.name || "Vendor Manager"}</span>
                          <Badge variant="purple">Recommendation: {fb.recommendation}</Badge>
                        </div>
                        <span className="text-slate-400">{new Date(fb.createdAt).toLocaleString()}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 font-semibold text-slate-800">
                        <div>Overall: <span className="text-brand-600 font-black">{fb.overallRating}/5</span></div>
                        <div>Technical: <span className="text-brand-600 font-black">{fb.technicalRating}/5</span></div>
                        <div>Comm: <span className="text-brand-600 font-black">{fb.communicationRating}/5</span></div>
                        <div>Fit: <span className="text-brand-600 font-black">{fb.experienceFit}/5</span></div>
                      </div>

                      {fb.strengths && (
                        <div>
                          <strong className="text-emerald-700">Strengths: </strong>
                          <span className="text-slate-700">{fb.strengths}</span>
                        </div>
                      )}
                      {fb.concerns && (
                        <div>
                          <strong className="text-rose-700">Concerns: </strong>
                          <span className="text-slate-700">{fb.concerns}</span>
                        </div>
                      )}
                      {fb.comments && (
                        <div>
                          <strong className="text-slate-800">Comments: </strong>
                          <span className="text-slate-700">{fb.comments}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Status History Log */}
            <Card>
              <CardHeader title="Status & Audit History Timeline" />
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {sub.statusHistoryList.map((sh) => (
                  <div key={sh.id} className="flex items-start gap-3 relative z-10 text-xs">
                    <div className="w-7 h-7 rounded-full bg-brand-100 border border-brand-300 text-brand-700 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>
                          Status changed from <Badge status={sh.fromStatus}>{sh.fromStatus}</Badge> to <Badge status={sh.toStatus}>{sh.toStatus}</Badge>
                        </span>
                        <span className="text-slate-400 text-[11px] font-normal">
                          {new Date(sh.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {sh.reason && <p className="text-slate-600 mt-1">{sh.reason}</p>}
                      <p className="text-[11px] text-slate-400 mt-1">Updated by: {sh.user?.name || "System"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
