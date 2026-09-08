import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { Building2, Mail, Phone, Calendar } from "lucide-react";

export default async function AdminVendorsPage() {
  const user = await requireAdmin();

  const vendorList = await db.query.vendors.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: {
      users: true,
      jobDescriptions: true,
      submissions: true,
    },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vendor Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Registered recruitment vendors, partner contacts, and platform usage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendorList.map((v) => (
            <Card key={v.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                    {v.code}
                  </span>
                  <Badge status={v.status}>{v.status}</Badge>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{v.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{v.notes || "Registered recruitment vendor partner."}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{v.contactEmail}</span>
                  </div>
                  {v.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{v.contactPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Added {new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  <strong className="text-slate-900">{v.jobDescriptions.length}</strong> Jobs
                </span>
                <span>
                  <strong className="text-slate-900">{v.submissions.length}</strong> Submissions
                </span>
                <span>
                  <strong className="text-slate-900">{v.users.length}</strong> Users
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
