import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/db";
import { vendors, jobDescriptions, candidateSubmissions } from "@/db/schema";
import { sql } from "drizzle-orm";
import { BarChart3, TrendingUp, Users, Award } from "lucide-react";

export default async function AdminReportsPage() {
  const user = await requireAdmin();

  // Aggregate stats
  const pipelineStats = await db
    .select({
      status: candidateSubmissions.status,
      count: sql<number>`count(*)`,
    })
    .from(candidateSubmissions)
    .groupBy(candidateSubmissions.status);

  const vendorReportList = await db.query.vendors.findMany({
    with: {
      jobDescriptions: true,
      submissions: {
        with: { feedbackList: true },
      },
    },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruitment Analytics & Reports</h2>
          <p className="text-sm text-slate-500 mt-1">
            Pipeline status breakdown, client performance, and candidate selection ratios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pipeline Breakdown */}
          <Card className="md:col-span-1">
            <CardHeader title="Pipeline Distribution" subtitle="Active Candidate Submissions by Status" />
            <div className="space-y-3 text-xs">
              {pipelineStats.map((stat) => (
                <div key={stat.status} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Badge status={stat.status}>{stat.status}</Badge>
                  <span className="font-extrabold text-slate-900 text-sm">{stat.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Vendor Performance Report */}
          <Card className="md:col-span-2">
            <CardHeader title="Client Performance Analytics" subtitle="CV submissions, interviews, and onboarding metrics per client" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3">JDs Created</th>
                    <th className="py-2.5 px-3">CVs Received</th>
                    <th className="py-2.5 px-3">Interviews</th>
                    <th className="py-2.5 px-3">Onboarded</th>
                    <th className="py-2.5 px-3">Avg Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorReportList.map((vend) => {
                    const interviewCount = vend.submissions.filter(
                      (s) => s.status === "INTERVIEW_SCHEDULED" || s.status === "INTERVIEW_COMPLETED"
                    ).length;
                    const onboardedCount = vend.submissions.filter((s) => s.status === "ONBOARDED" || s.status === "BILLED").length;

                    let totalRatings = 0;
                    let ratingCount = 0;
                    vend.submissions.forEach((s) => {
                      s.feedbackList.forEach((f) => {
                        totalRatings += f.overallRating;
                        ratingCount++;
                      });
                    });
                    const avgRating = ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : "N/A";

                    return (
                      <tr key={vend.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          <div>
                            <span>{vend.name}</span>
                            <p className="text-[10px] text-slate-500 font-mono">{vend.code}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{vend.jobDescriptions.length}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{vend.submissions.length}</td>
                        <td className="py-3 px-3 font-bold text-purple-700">{interviewCount}</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">{onboardedCount}</td>
                        <td className="py-3 px-3 font-bold text-slate-600">{avgRating}{avgRating !== "N/A" && " / 5"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
