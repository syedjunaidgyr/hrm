import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getJobs } from "@/services/job.service";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { FileText, Users } from "lucide-react";

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

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Descriptions Table</h2>
            <p className="text-sm text-slate-500 mt-1">
              Active Job Descriptions created and directly submitted by recruitment vendors.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Link
              href="/admin/jobs"
              className={`px-4 py-2 text-xs font-black rounded-full transition-all ${
                status === "ALL"
                  ? "bg-[#1E1E1E] text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-300/80 hover:bg-slate-50"
              }`}
            >
              All Jobs
            </Link>
            <Link
              href="/admin/jobs?status=SUBMITTED"
              className={`px-4 py-2 text-xs font-black rounded-full transition-all ${
                status === "SUBMITTED"
                  ? "bg-[#1E1E1E] text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-300/80 hover:bg-slate-50"
              }`}
            >
              Submitted
            </Link>
            <Link
              href="/admin/jobs?status=DRAFT"
              className={`px-4 py-2 text-xs font-black rounded-full transition-all ${
                status === "DRAFT"
                  ? "bg-[#1E1E1E] text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-300/80 hover:bg-slate-50"
              }`}
            >
              Drafts
            </Link>
            <Link
              href="/admin/jobs?status=CLOSED"
              className={`px-4 py-2 text-xs font-black rounded-full transition-all ${
                status === "CLOSED"
                  ? "bg-[#1E1E1E] text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-300/80 hover:bg-slate-50"
              }`}
            >
              Closed
            </Link>
          </div>
        </div>

        {/* Job Table Container */}
        <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xs p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Job Code</th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Positions</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                      No Job Descriptions found.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">{job.jobCode}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>
                          <span>{job.title}</span>
                          <p className="text-[11px] text-slate-500 font-normal">{job.department}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">{job.vendor?.name}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{job.location}</td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">{job.numPositions}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={job.priority}>{job.priority}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={job.status}>{job.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/jobs/${job.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-300/80 text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Details
                          </Link>
                          <Link
                            href={`/admin/jobs/${job.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#1E1E1E] text-white hover:bg-slate-800 transition-all shadow-2xs"
                          >
                            <Users className="w-3.5 h-3.5" /> Submit Candidate
                          </Link>
                        </div>
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
