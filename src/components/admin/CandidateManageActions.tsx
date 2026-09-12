"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

type Variant = "full" | "compact" | "resume-only";

export function CandidateManageActions({
  candidateId,
  candidateName,
  fileId,
  hasSubmissions = false,
  variant = "full",
  redirectOnDelete,
}: {
  candidateId: string;
  candidateName: string;
  fileId?: string | null;
  hasSubmissions?: boolean;
  variant?: Variant;
  redirectOnDelete?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"replace" | "resume" | "candidate" | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  const refresh = () => {
    if (redirectOnDelete && busy === "candidate") return;
    router.refresh();
  };

  const friendly = (message?: string) => message?.replace(/^[A-Z0-9_]+:\s*/, "") || message;

  const replaceResume = async (file: File) => {
    setBusy("replace");
    setToast(null);
    try {
      const data = new FormData();
      data.append("resume", file);
      const res = await fetch(`/api/admin/candidates/${candidateId}/resume`, { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Replace failed", message: friendly(json.error?.message) || "Could not replace resume." });
        return;
      }
      setToast({ type: "success", title: "Resume replaced", message: `${file.name} is now the current resume.` });
      router.refresh();
    } catch {
      setToast({ type: "error", title: "Network error", message: "Failed to upload the new resume." });
    } finally {
      setBusy(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteResume = async () => {
    if (!fileId) return;
    if (!confirm(`Delete the resume for ${candidateName}? This cannot be undone.`)) return;
    setBusy("resume");
    setToast(null);
    try {
      const res = await fetch(`/api/admin/candidates/${candidateId}/resume?fileId=${encodeURIComponent(fileId)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Delete resume failed", message: friendly(json.error?.message) || "Could not delete resume." });
        return;
      }
      setToast({ type: "success", title: "Resume deleted" });
      refresh();
    } catch {
      setToast({ type: "error", title: "Network error", message: "Failed to delete resume." });
    } finally {
      setBusy(null);
    }
  };

  const deleteCand = async () => {
    if (
      !confirm(
        `Delete candidate ${candidateName}? This also removes their resume and job submissions. This cannot be undone.`
      )
    ) {
      return;
    }
    setBusy("candidate");
    setToast(null);
    try {
      const res = await fetch(`/api/admin/candidates/${candidateId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Delete failed", message: friendly(json.error?.message) || "Could not delete candidate." });
        return;
      }
      if (redirectOnDelete) {
        router.push(redirectOnDelete);
        router.refresh();
        return;
      }
      setToast({ type: "success", title: "Candidate deleted" });
      router.refresh();
    } catch {
      setToast({ type: "error", title: "Network error", message: "Failed to delete candidate." });
    } finally {
      setBusy(null);
    }
  };

  const btn =
    "inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="space-y-2">
      {toast && (
        <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void replaceResume(file);
        }}
      />
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!!busy}
          className={`${btn} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
        >
          {busy === "replace" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Replace Resume
        </button>
        {variant === "full" && fileId && (
          <button
            type="button"
            onClick={() => void deleteResume()}
            disabled={!!busy}
            className={`${btn} border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}
          >
            {busy === "resume" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete Resume
          </button>
        )}
        {variant === "compact" && fileId && !hasSubmissions && (
          <button
            type="button"
            onClick={() => void deleteResume()}
            disabled={!!busy}
            className={`${btn} border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}
          >
            {busy === "resume" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete Resume
          </button>
        )}
        {variant !== "resume-only" && (
          <button
            type="button"
            onClick={() => void deleteCand()}
            disabled={!!busy}
            className={`${btn} border-rose-300 bg-rose-600 text-white hover:bg-rose-700`}
          >
            {busy === "candidate" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete Candidate
          </button>
        )}
      </div>
    </div>
  );
}
