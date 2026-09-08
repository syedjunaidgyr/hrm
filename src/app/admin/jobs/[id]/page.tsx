import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getJobById } from "@/services/job.service";
import { CandidateModalForm } from "@/app/admin/candidates/CandidateModalForm";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft, Download, Eye, Briefcase, MapPin, DollarSign, Calendar, Users } from "lucide-react";

import { ResumePreviewModal } from "@/components/ui/ResumePreviewModal";

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id: jobId } = await params;

  const job = await getJobById(jobId);

  const formattedJobs = [
    {
      id: job.id,
      title: job.title,
      jobCode: job.jobCode,
      vendorName: job.vendor.name,
    },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/jobs"
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                  {job.jobCode}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{job.title}</h2>
                <Badge status={job.priority}>{job.priority}</Badge>
                <Badge status={job.status}>{job.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Vendor: <strong className="text-slate-800">{job.vendor.name}</strong> ({job.vendor.code}) • Department: <strong className="text-slate-800">{job.department}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CandidateModalForm jobs={formattedJobs} defaultJobId={job.id} buttonLabel="Submit Candidate with Resume" />
          </div>
        </div>

        {/* Job Details Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Job Specification & Requirements" />
              <div className="space-y-4 text-xs text-slate-700">
                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500 mb-1">
                    Job Description
                  </h4>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-800">
                    {job.description}
                  </p>
                </div>

                {job.responsibilities && (
                  <div>
                    <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-slate-500 mb-1">
                      Key Responsibilities
                    </h4>
                    <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-800">
                      {job.responsibilities}
                    </p>
                  </div>
                )}

                {job.requirements && (
                  <div>
                    <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-slate-500 mb-1">
                      Candidate Requirements
                    </h4>
                    <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-800">
                      {job.requirements}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-slate-500">
                      Required Skills
                    </h4>
                    <p className="font-semibold text-brand-700 bg-brand-50 p-2.5 rounded-lg border border-brand-200 mt-1">
                      {job.requiredSkills}
                    </p>
                  </div>
                  {job.preferredSkills && (
                    <div>
                      <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-slate-500">
                        Preferred Skills
                      </h4>
                      <p className="font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                        {job.preferredSkills}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader title="Overview Summary" />
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Location</span>
                  <span className="font-bold text-slate-900">{job.location}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Employment Type</span>
                  <span className="font-bold text-slate-900">{job.employmentType} ({job.workMode})</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Experience Range</span>
                  <span className="font-bold text-slate-900">{job.minExperience} - {job.maxExperience} Yrs</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Open Positions</span>
                  <span className="font-bold text-slate-900">{job.numPositions} Positions</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Budget Range</span>
                  <span className="font-bold text-emerald-700">
                    {job.minSalary ? `$${job.minSalary} - $${job.maxSalary}` : "Negotiable"}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Notice Period</span>
                  <span className="font-bold text-slate-900">{job.noticePeriod || "Standard"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Created Date</span>
                  <span className="font-semibold text-slate-700">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Submitted Candidates Table for this specific Job */}
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                Submitted Candidates ({job.submissions.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Candidates submitted specifically for this Job Description.
              </p>
            </div>
            <CandidateModalForm jobs={formattedJobs} defaultJobId={job.id} buttonLabel="Submit Candidate with Resume" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Experience</th>
                  <th className="py-2.5 px-3">Skills</th>
                  <th className="py-2.5 px-3">Current Status</th>
                  <th className="py-2.5 px-3">Resume</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {job.submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                      No candidates submitted yet for this job. Click "Submit Candidate with Resume" above to submit one.
                    </td>
                  </tr>
                ) : (
                  job.submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div>
                          <Link
                            href={`/admin/candidates/${sub.candidate.id}`}
                            className="text-brand-700 hover:underline font-bold"
                          >
                            {sub.candidate.name}
                          </Link>
                          <p className="text-[11px] text-slate-500 font-normal">{sub.candidate.email} • {sub.candidate.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-semibold">
                        {sub.candidate.totalExperience} Yrs
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{sub.candidate.skills}</td>
                      <td className="py-3 px-3">
                        <Badge status={sub.status}>{sub.status}</Badge>
                      </td>
                      <td className="py-3 px-3">
                        {sub.resumeFile ? (
                          <ResumePreviewModal
                            fileId={sub.resumeFile.id}
                            fileName={sub.resumeFile.fileName}
                            candidateName={sub.candidate.name}
                            triggerLabel="Preview Resume"
                            triggerVariant="link"
                          />
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/candidates/${sub.candidate.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:underline"
                        >
                          Journey / Timeline →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
