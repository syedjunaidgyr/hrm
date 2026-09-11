import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientUsersClient } from "./ClientUsersClient";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function AdminClientUsersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const client = await db.query.vendors.findFirst({ where: eq(vendors.id, id) });
  if (!client) notFound();

  return (
    <DashboardLayout user={user}>
      <ClientUsersClient clientId={client.id} clientName={client.name} />
    </DashboardLayout>
  );
}
