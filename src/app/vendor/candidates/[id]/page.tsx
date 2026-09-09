import React from "react";
import { requireVendor } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getSubmissionById } from "@/services/submission.service";
import { VendorActionForms } from "./VendorActionForms";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Download, ArrowLeft, Star, Clock, FileText } from "lucide-react";

import { ResumePreviewModal } from "@/components/ui/ResumePreviewModal";

export default async function VendorCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireVendor();
  const { id: submissionId } = await params;

  // Strict Vendor query-level IDOR protection
  const sub = await getSubmissionById(submissionId, user.role, user.vendorId);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/vendor/candidates"
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
                Submitted for: <strong className="text-slate-800">{sub.job.title}</strong> ({sub.job.jobCode})
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
                  <p className="text-slate-400 font-semibold uppercase">Candidate Name</p>
                  <p className="font-bold text-slate-900 mt-0.5">{sub.candidate.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Current Company & Designation</p>
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
                  <p className="text-slate-400 font-semibold uppercase">Location</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{sub.candidate.currentLocation || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Technical Skills</p>
                  <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded-md border border-slate-100 mt-0.5">
                    {sub.candidate.skills}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Notice Period</p>
                  <p className="font-bold text-slate-900 mt-0.5">{sub.candidate.noticePeriod || "N/A"}</p>
                </div>
              </div>
            </Card>

            {/* Historical Feedback List */}
            <Card>
              <CardHeader title="Previous Feedback History" />
              {sub.feedbackList.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No feedback submitted yet for this candidate.</p>
              ) : (
                <div className="space-y-3 divide-y divide-slate-100 text-xs">
                  {sub.feedbackList.map((fb) => (
                    <div key={fb.id} className="pt-2 first:pt-0 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-brand-600">Rating: {fb.overallRating}/5</span>
                        <Badge variant="purple">{fb.recommendation}</Badge>
                      </div>
                      {fb.comments && <p className="text-slate-700 italic">"{fb.comments}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Action Forms & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <VendorActionForms submissionId={sub.id} currentStatus={sub.status} />

            {/* Status Transition History Timeline */}
            <Card>
              <CardHeader title="Candidate Status History Timeline" />
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {sub.statusHistoryList.map((sh) => (
                  <div key={sh.id} className="flex items-start gap-3 relative z-10 text-xs">
                    <div className="w-7 h-7 rounded-full bg-brand-100 border border-brand-300 text-brand-700 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>
                          From <Badge status={sh.fromStatus}>{sh.fromStatus}</Badge> to <Badge status={sh.toStatus}>{sh.toStatus}</Badge>
                        </span>
                        <span className="text-slate-400 text-[11px] font-normal">
                          {new Date(sh.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {sh.reason && <p className="text-slate-600 mt-1">{sh.reason}</p>}
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
