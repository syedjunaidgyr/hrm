"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { ResumePreviewModal } from "@/components/ui/ResumePreviewModal";
import { CandidateManageActions } from "@/components/admin/CandidateManageActions";

interface SubmissionRow {
  id: string;
  status: string;
  notifiedAt?: string | Date | null;
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalExperience: string | number;
    skills: string;
  };
  resumeFile: { id: string; fileName: string } | null;
}

export function NotifyClientSubmissions({
  submissions,
}: {
  submissions: SubmissionRow[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  const allSelected = submissions.length > 0 && selected.size === submissions.length;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(submissions.map((s) => s.id)));
  };

  const handleNotify = async () => {
    if (selected.size === 0) {
      setToast({ type: "error", title: "Select CVs", message: "Select at least one CV to notify the client." });
      return;
    }
    setLoading(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/submissions/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setToast({ type: "error", title: "Notify failed", message: data.error?.message || "Could not notify client." });
        return;
      }
      const emailed = (data.results || []).reduce((n: number, r: any) => n + (r.emailed || 0), 0);
      setToast({
        type: "success",
        title: "Client notified",
        message: emailed
          ? `Email sent for ${selected.size} CV(s).`
          : `In-app notification sent for ${selected.size} CV(s). Configure SMTP to send email.`,
      });
      setSelected(new Set());
      router.refresh();
    } catch {
      setToast({ type: "error", title: "Network error", message: "Failed to reach server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {toast && (
        <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
      )}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-slate-500">
          {selected.size > 0 ? `${selected.size} CV(s) selected` : "Select CVs to notify the client"}
        </p>
        <button
          type="button"
          onClick={handleNotify}
          disabled={loading || selected.size === 0}
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#FDD868] text-[#1E1E1E] hover:bg-[#f5c84a] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          Notify Client
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wide">
              <th className="py-2.5 px-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="py-2.5 px-3">Candidate</th>
              <th className="py-2.5 px-3">Experience</th>
              <th className="py-2.5 px-3">Skills</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Notified</th>
              <th className="py-2.5 px-3">Resume</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500 font-medium">
                  No CVs submitted yet. Click &quot;Submit CV&quot; above.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selected.has(sub.id)}
                      onChange={() => toggle(sub.id)}
                      aria-label={`Select ${sub.candidate.name}`}
                    />
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    <div>
                      <Link
                        href={`/admin/candidates/${sub.candidate.id}`}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        {sub.candidate.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 font-normal">
                        {sub.candidate.email} • {sub.candidate.phone}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {sub.candidate.totalExperience} Yrs
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                    {sub.candidate.skills}
                  </td>
                  <td className="py-3 px-3">
                    <Badge status={sub.status}>{sub.status.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {sub.notifiedAt
                      ? new Date(sub.notifiedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-3 px-3">
                    {sub.resumeFile ? (
                      <ResumePreviewModal
                        fileId={sub.resumeFile.id}
                        fileName={sub.resumeFile.fileName}
                        candidateName={sub.candidate.name}
                        triggerLabel="Preview"
                        triggerVariant="link"
                      />
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <Link
                        href={`/admin/candidates/${sub.candidate.id}`}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Timeline →
                      </Link>
                      <CandidateManageActions
                        candidateId={sub.candidate.id}
                        candidateName={sub.candidate.name}
                        fileId={sub.resumeFile?.id}
                        hasSubmissions
                        variant="compact"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
