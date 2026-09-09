import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientsClient } from "./ClientsClient";
import { db } from "@/db";

export default async function AdminClientsPage() {
  const user = await requireAdmin();

  // Initial server-side load
  const clientList = await db.query.vendors.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: {
      users: true,
      jobDescriptions: true,
      submissions: true,
      projects: true,
    },
  });

  return (
    <DashboardLayout user={user}>
      <ClientsClient initialClients={clientList} />
    </DashboardLayout>
  );
}
