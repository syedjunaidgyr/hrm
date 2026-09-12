import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getJobById } from "@/services/job.service";
import { CandidateModalForm } from "@/app/admin/candidates/CandidateModalForm";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft, Users, Pencil } from "lucide-react";
import { NotifyClientSubmissions } from "@/components/admin/NotifyClientSubmissions";

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id: jobId } = await params;

  const job = await getJobById(jobId);

  const formattedJobs = [
    { id: job.id, title: job.title, jobCode: job.jobCode, vendorName: job.vendor.name },
  ];

  const disciplineName =
    (job as any).discipline?.name ?? job.department ?? "—";
  const projectName = (job as any).project?.name ?? "—";

  const submissionRows = job.submissions.map((sub) => ({
    id: sub.id,
    status: sub.status,
    notifiedAt: (sub as any).notifiedAt
      ? new Date((sub as any).notifiedAt).toISOString()
      : null,
    candidate: {
      id: sub.candidate.id,
      name: sub.candidate.name,
      email: sub.candidate.email,
      phone: sub.candidate.phone,
      totalExperience: sub.candidate.totalExperience,
      skills: sub.candidate.skills,
    },
    resumeFile: sub.resumeFile
      ? { id: sub.resumeFile.id, fileName: sub.resumeFile.fileName }
      : null,
  }));

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/jobs"
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
                Client: <strong className="text-slate-800">{job.vendor.name}</strong>
                {projectName !== "—" && (
                  <>
                    {" "}
                    • Project: <strong className="text-slate-800">{projectName}</strong>
                  </>
                )}{" "}
                • Discipline: <strong className="text-slate-800">{disciplineName}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/jobs/${job.id}/edit`}
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
            >
              <Pencil className="w-4 h-4" /> Edit JD
            </Link>
            <CandidateModalForm jobs={formattedJobs} defaultJobId={job.id} buttonLabel="Submit CV" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                {job.requirements && (
                  <div>
                    <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-slate-500 mb-1">
                      Requirements
                    </h4>
                    <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-800">
                      {job.requirements}
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

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader title="Overview" />
              <div className="space-y-2.5 text-xs text-slate-700">
                {[
                  { label: "Client", value: job.vendor.name },
                  { label: "Project", value: projectName },
                  { label: "Discipline", value: disciplineName },
                  { label: "Location", value: job.location },
                  { label: "Employment Type", value: `${job.employmentType} (${job.workMode})` },
                  { label: "Experience", value: `${job.minExperience} – ${job.maxExperience} Yrs` },
                  { label: "Open Positions", value: `${job.numPositions}` },
                  { label: "Delivered", value: `${job.deliveredQty}` },
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

        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                Submitted CVs ({job.submissions.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select CVs and click Notify Client to email the client contact.
              </p>
            </div>
            <CandidateModalForm jobs={formattedJobs} defaultJobId={job.id} buttonLabel="Submit CV" />
          </div>

          <NotifyClientSubmissions submissions={submissionRows} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
