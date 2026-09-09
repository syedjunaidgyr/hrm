import React from "react";
import { requireVendor } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getJobs } from "@/services/job.service";
import { db } from "@/db";
import { disciplines, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ClientJobTable } from "./ClientJobTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function VendorJobsPage() {
  const user = await requireVendor();
  const vendorId = user.vendorId!;

  const [{ jobs }, disciplineList, projectList] = await Promise.all([
    getJobs({ vendorId, limit: 200 }),
    db.query.disciplines.findMany({ orderBy: (t, { asc }) => [asc(t.name)] }),
    db.query.projects.findMany({
      where: eq(projects.clientId, vendorId),
      orderBy: (t, { asc }) => [asc(t.name)],
    }),
  ]);

  // Normalise jobs to the shape ClientJobTable expects
  const tableJobs = jobs.map((job) => ({
    id: job.id,
    jobCode: job.jobCode,
    title: job.title,
    location: job.location,
    numPositions: job.numPositions,
    deliveredQty: job.deliveredQty,
    priority: job.priority,
    status: job.status,
    dateReceived: job.dateReceived ? String(job.dateReceived) : null,
    department: job.department ?? null,
    discipline: (job as any).discipline ?? null,
    project: (job as any).project ?? null,
    submissions: (job.submissions ?? []).map((s: any) => ({
      id: s.id,
      status: s.status,
      candidate: {
        id: s.candidate?.id ?? s.candidateId,
        name: s.candidate?.name ?? "—",
        currentDesignation: s.candidate?.currentDesignation ?? null,
      },
      resumeFile: s.resumeFile ?? null,
    })),
  }));

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Descriptions</h2>
            <p className="text-sm text-slate-500 mt-1">
              All active Job Descriptions assigned to your account.
            </p>
          </div>
          <Link
            href="/vendor/jobs/new"
            className="inline-flex items-center gap-2 font-bold text-xs px-4 py-2.5 rounded-xl bg-[#1E1E1E] hover:bg-slate-800 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Job Description
          </Link>
        </div>

        <ClientJobTable
          jobs={tableJobs}
          disciplines={disciplineList.map((d) => ({ id: d.id, name: d.name }))}
          projects={projectList.map((p) => ({ id: p.id, name: p.name }))}
        />
      </div>
    </DashboardLayout>
  );
}
