import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminJobForm } from "./AdminJobForm";
import { db } from "@/db";
import { vendors } from "@/db/schema";

export default async function AdminNewJobPage() {
  const user = await requireAdmin();

  const clientList = await db.query.vendors.findMany({
    where: (t, { eq }) => eq(t.status, "ACTIVE"),
    orderBy: (t, { asc }) => [asc(t.name)],
    columns: { id: true, name: true, code: true },
  });

  return (
    <DashboardLayout user={user}>
      <AdminJobForm clients={clientList} />
    </DashboardLayout>
  );
}
