import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusMastersClient } from "./StatusMastersClient";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { asc } from "drizzle-orm";

export default async function AdminStatusMastersPage() {
  const user = await requireAdmin();
  const clients = await db.query.vendors.findMany({
    columns: { id: true, name: true },
    orderBy: [asc(vendors.name)],
  });

  return (
    <DashboardLayout user={user}>
      <StatusMastersClient clients={clients} />
    </DashboardLayout>
  );
}
