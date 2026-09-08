import React from "react";
import { requireVendor } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getSubmissions } from "@/services/submission.service";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Eye, Download, Star } from "lucide-react";

export default async function VendorCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const user = await requireVendor();
  const vendorId = user.vendorId!;
  const params = await searchParams;

  const status = params.status || "ALL";
  const page = parseInt(params.page || "1", 10);

  // Vendor-isolated candidate submissions query
  const { submissions, total, totalPages } = await getSubmissions({
    vendorId,
    status,
    page,
    limit: 25,
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidates Submitted for My Jobs</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review candidate profiles submitted by Admin, view resumes, submit structured feedback, and update recruitment status.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Job Description</th>
                  <th className="px-4 py-3.5">Experience</th>
                  <th className="px-4 py-3.5">Skills</th>
                  <th className="px-4 py-3.5">Submitted</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Last Feedback</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No candidates currently submitted for your job descriptions.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => {
                    const lastFb = sub.feedbackList[0];
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          <div>
                            <span>{sub.candidate.name}</span>
                            <p className="text-xs text-slate-500 font-normal">{sub.candidate.currentCompany || "N/A"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          <p className="font-bold text-slate-900">{sub.job.title}</p>
                          <p className="font-mono text-slate-500">{sub.job.jobCode}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">
                          {sub.candidate.totalExperience} Yrs
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate">
                          {sub.candidate.skills}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge status={sub.status}>{sub.status}</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          {lastFb ? (
                            <span className="font-semibold text-purple-700">
                              Rating: {lastFb.overallRating}/5 ({lastFb.recommendation})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic font-medium">Pending Feedback</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/vendor/candidates/${sub.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View / Rate
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
