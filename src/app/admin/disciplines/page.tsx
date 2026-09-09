import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DisciplinesClient } from "./DisciplinesClient";

export default async function AdminDisciplinesPage() {
  const user = await requireAdmin();
  return (
    <DashboardLayout user={user}>
      <DisciplinesClient />
    </DashboardLayout>
  );
}
