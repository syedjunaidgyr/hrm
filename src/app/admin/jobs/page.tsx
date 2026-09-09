import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getJobs } from "@/services/job.service";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { FileText, Upload, Plus } from "lucide-react";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;

  const status = params.status || "ALL";
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);

  const { jobs, total, totalPages } = await getJobs({
    status,
    search,
    page,
    limit: 25,
  });

  const statusTabs = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "WIP", value: "WIP" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Descriptions</h2>
            <p className="text-sm text-slate-500 mt-1">
              All Job Descriptions across all clients.
            </p>
          </div>
          <Link
            href="/admin/jobs/import"
            className="inline-flex items-center gap-2 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
          >
            <Upload className="w-4 h-4" /> Import Spreadsheet
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-2 overflow-x-auto">
          {statusTabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/jobs?status=${tab.value}`}
              className={`px-4 py-2 text-xs font-black rounded-full whitespace-nowrap transition-all ${
                status === tab.value
                  ? "bg-[#1E1E1E] text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-300/80 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xs p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">JD Code</th>
                  <th className="py-3 px-4">Date Received</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Positions</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">CVs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-slate-500 font-medium">
                      No Job Descriptions found.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="font-mono text-xs font-bold text-blue-600 hover:underline"
                        >
                          {job.jobCode}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {job.dateReceived
                          ? new Date(job.dateReceived).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {job.vendor?.name ?? "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {(job as any).project?.name ?? "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {(job as any).discipline?.name ?? job.department ?? "—"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{job.title}</td>
                      <td className="py-3.5 px-4 text-slate-600">{job.location}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 text-center">
                        {job.numPositions}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={job.priority}>{job.priority}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={job.status}>{job.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-300/80 text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {job.submissions?.length ?? 0} CVs
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={total}
              pageSize={25}
              getPageUrl={(p) => `/admin/jobs?status=${status}&page=${p}`}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
