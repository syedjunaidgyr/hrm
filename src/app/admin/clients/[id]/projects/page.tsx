import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientProjectsClient } from "./ClientProjectsClient";

export default async function ClientProjectsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id: clientId } = await params;

  return (
    <DashboardLayout user={user}>
      <ClientProjectsClient clientId={clientId} />
    </DashboardLayout>
  );
}
