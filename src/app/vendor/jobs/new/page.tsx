import React from "react";
import { requireVendor } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { JobForm } from "./JobForm";

export default async function VendorNewJobPage() {
  const user = await requireVendor();
  return (
    <DashboardLayout user={user}>
      <JobForm />
    </DashboardLayout>
  );
}
