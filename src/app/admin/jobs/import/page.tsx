import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { JobImportClient } from "./JobImportClient";

export default async function JobImportPage() {
  const user = await requireAdmin();

  return (
    <DashboardLayout user={user}>
      <JobImportClient />
    </DashboardLayout>
  );
}
