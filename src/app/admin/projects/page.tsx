import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ProjectsClient } from "./ProjectsClient";

export default async function AdminProjectsPage() {
  const user = await requireAdmin();

  const [allProjects, allClients] = await Promise.all([
    db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)],
      with: {
        client: { columns: { id: true, name: true, code: true } },
      },
    }),
    db.query.vendors.findMany({
      columns: { id: true, name: true, code: true },
      orderBy: (t, { asc }) => [asc(t.name)],
    }),
  ]);

  return (
    <DashboardLayout user={user}>
      <ProjectsClient initialProjects={allProjects} clients={allClients} />
    </DashboardLayout>
  );
}
