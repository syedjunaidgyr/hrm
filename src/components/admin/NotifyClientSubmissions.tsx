"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

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
  children,
}: {
  submissions: SubmissionRow[];
  children: (props: {
    selected: Set<string>;
    toggle: (id: string) => void;
    toggleAll: () => void;
    allSelected: boolean;
  }) => React.ReactNode;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === submissions.length) setSelected(new Set());
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
      {children({
        selected,
        toggle,
        toggleAll,
        allSelected: submissions.length > 0 && selected.size === submissions.length,
      })}
    </div>
  );
}
