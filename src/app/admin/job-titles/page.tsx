import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { JobTitlesClient } from "./JobTitlesClient";

export default async function AdminJobTitlesPage() {
  const user = await requireAdmin();
  return (
    <DashboardLayout user={user}>
      <JobTitlesClient />
    </DashboardLayout>
  );
}
