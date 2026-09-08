import React from "react";
import { requireVendor } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getJobs } from "@/services/job.service";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Plus, Eye, Edit3 } from "lucide-react";

export default async function VendorJobsPage() {
  const user = await requireVendor();
  const vendorId = user.vendorId!;

  const { jobs } = await getJobs({ vendorId, limit: 100 });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Job Descriptions</h2>
            <p className="text-sm text-slate-500 mt-1">
              Create, manage, and submit Job Descriptions directly for active recruitment.
            </p>
          </div>
          <Link
            href="/vendor/jobs/new"
            className="inline-flex items-center gap-2 font-bold text-xs px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Job Description
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Job Code</th>
                  <th className="px-4 py-3.5">Job Title</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Positions</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Submissions</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No Job Descriptions created yet. Click above to create one.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900">{job.jobCode}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{job.title}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{job.department}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{job.location}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">{job.numPositions}</td>
                      <td className="px-4 py-3.5">
                        <Badge status={job.priority}>{job.priority}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge status={job.status}>{job.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-bold text-brand-600">
                        {job.submissions.length} Candidates
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/vendor/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
