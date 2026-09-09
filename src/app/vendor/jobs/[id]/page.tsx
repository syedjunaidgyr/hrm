import React from "react";
import { requireVendor } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getJobById } from "@/services/job.service";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft, Users, Pencil } from "lucide-react";
import { ResumePreviewModal } from "@/components/ui/ResumePreviewModal";

export default async function VendorJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireVendor();
  const { id: jobId } = await params;

  const job = await getJobById(jobId, user.vendorId);

  const disciplineName = (job as any).discipline?.name ?? job.department ?? "—";
  const projectName = (job as any).project?.name ?? "—";

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/vendor/jobs"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                  {job.jobCode}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{job.title}</h2>
                <Badge status={job.priority}>{job.priority}</Badge>
                <Badge status={job.status}>{job.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Discipline: <strong className="text-slate-800">{disciplineName}</strong>
                {projectName !== "—" && (
                  <> • Project: <strong className="text-slate-800">{projectName}</strong></>
                )}
                {" "}• Location: <strong className="text-slate-800">{job.location}</strong>
              </p>
            </div>
          </div>
          <Link
            href={`/vendor/jobs/${job.id}/edit`}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
          >
            <Pencil className="w-4 h-4" /> Edit JD
          </Link>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — spec */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Job Specification & Requirements" />
              <div className="space-y-4 text-xs text-slate-700">
                <div>
                  <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-slate-500 mb-1">
                    Job Description
                  </h4>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-800">
                    {job.description}
                  </p>
                </div>

                {job.responsibilities && (
                  <div>
                    <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-slate-500 mb-1">
                      Key Responsibilities
                    </h4>
                    <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-800">
                      {job.responsibilities}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-slate-500">
                      Required Skills
                    </h4>
                    <p className="font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1 text-slate-800">
                      {job.requiredSkills}
                    </p>
                  </div>
                  {job.preferredSkills && (
                    <div>
                      <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-slate-500">
                        Preferred Skills
                      </h4>
                      <p className="font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1 text-slate-700">
                        {job.preferredSkills}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right — summary */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader title="Overview" />
              <div className="space-y-2.5 text-xs text-slate-700">
                {[
                  { label: "Project", value: projectName },
                  { label: "Discipline", value: disciplineName },
                  { label: "Employment Type", value: `${job.employmentType} (${job.workMode})` },
                  { label: "Experience", value: `${job.minExperience} – ${job.maxExperience} Yrs` },
                  { label: "Open Positions", value: `${job.numPositions}` },
                  {
                    label: "Budget",
                    value: job.minSalary ? `$${job.minSalary} – $${job.maxSalary}` : "Negotiable",
                    green: true,
                  },
                  { label: "Notice Period", value: job.noticePeriod || "Standard" },
                  {
                    label: "Date Received",
                    value: job.dateReceived
                      ? new Date(job.dateReceived).toLocaleDateString()
                      : "—",
                  },
                  {
                    label: "Date Closed",
                    value: job.dateClosed
                      ? new Date(job.dateClosed).toLocaleDateString()
                      : "—",
                  },
                ].map(({ label, value, green }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between pb-2 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-bold ${green ? "text-emerald-700" : "text-slate-900"}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Submitted CVs */}
        <Card>
          <div className="pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Submitted CVs ({job.submissions.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              CVs submitted by Rightfit for this Job Description.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wide">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Experience</th>
                  <th className="py-2.5 px-3">Skills</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Resume</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {job.submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 font-medium">
                      No CVs submitted yet for this Job Description.
                    </td>
                  </tr>
                ) : (
                  job.submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">{sub.candidate.name}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {sub.candidate.totalExperience} Yrs
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {sub.candidate.skills}
                      </td>
                      <td className="py-3 px-3">
                        <Badge status={sub.status}>
                          {sub.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        {sub.resumeFile ? (
                          <ResumePreviewModal
                            fileId={sub.resumeFile.id}
                            fileName={sub.resumeFile.fileName}
                            candidateName={sub.candidate.name}
                            triggerLabel="Preview"
                            triggerVariant="link"
                          />
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/vendor/candidates/${sub.id}`}
                          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline text-[11px]"
                        >
                          Review →
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
