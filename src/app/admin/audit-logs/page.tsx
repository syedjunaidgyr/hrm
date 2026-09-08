import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getAuditLogs } from "@/services/audit.service";
import { ShieldCheck, User } from "lucide-react";

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const { logs } = await getAuditLogs({ page, limit: 50 });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Audit Logs</h2>
          <p className="text-sm text-slate-500 mt-1">
            Immutable audit trial of all security and state-changing actions performed across the platform.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Entity ID</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-sans font-medium">
                      No audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 font-sans font-semibold text-slate-900">
                        {log.user ? `${log.user.name} (${log.user.role})` : "System / Anonymous"}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-brand-700">{log.action}</td>
                      <td className="px-4 py-2.5 text-slate-800">{log.entityType}</td>
                      <td className="px-4 py-2.5 text-slate-500 text-[11px]">
                        {log.entityId ? log.entityId.substring(0, 18) + "..." : "N/A"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{log.ipAddress || "127.0.0.1"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
