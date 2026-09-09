"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, XCircle,
  AlertTriangle, Download, Loader2, ChevronRight,
} from "lucide-react";

interface ParsedRow {
  rowNum: number;
  errors: string[];
  data: {
    jobCode: string;
    title: string;
    location: string;
    discipline: string | null;
    priority: string;
    status: string;
    numPositions: number;
    dateReceived: string | null;
    dateClosed: string | null;
    vendorId: string | null;
  };
}

type Stage = "idle" | "previewing" | "importing" | "done";

export function JobImportClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<{ inserted: number; skipped: number; invalidRows: ParsedRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview([]);
    setResult(null);
    setError(null);
    setStage("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handlePreview = async () => {
    if (!file) return;
    setStage("previewing");
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("preview", "true");

    try {
      const res = await fetch("/api/admin/jobs/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message ?? "Preview failed.");
        setStage("idle");
        return;
      }
      setPreview(data.preview ?? []);
      setStage("previewing");
    } catch {
      setError("Network error during preview.");
      setStage("idle");
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setStage("importing");
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("preview", "false");

    try {
      const res = await fetch("/api/admin/jobs/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success && !data.inserted) {
        setError(data.error?.message ?? "Import failed.");
        setStage("previewing");
        return;
      }
      setResult({ inserted: data.inserted ?? 0, skipped: data.skipped ?? 0, invalidRows: data.invalidRows ?? [] });
      setStage("done");
    } catch {
      setError("Network error during import.");
      setStage("previewing");
    }
  };

  const validRows = preview.filter((r) => r.errors.length === 0);
  const invalidRows = preview.filter((r) => r.errors.length > 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Import Job Descriptions</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Upload an <strong>.xlsx</strong> or <strong>.csv</strong> file to bulk-create JDs.
            </p>
          </div>
        </div>

        {/* Download sample sheet button */}
        <a
          href="/api/admin/jobs/import"
          download="rightfit_jobs_sample.xlsx"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Download Sample Sheet
        </a>
      </div>

      {/* Column guide */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-2xs p-5 space-y-3">
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Expected Column Headers</p>
        <div className="flex flex-wrap gap-2">
          {[
            { col: "Client", req: true },
            { col: "Title", req: true },
            { col: "Location", req: true },
            { col: "Required Skills", req: true },
            { col: "Description", req: true },
            { col: "JD Code", req: false },
            { col: "Discipline", req: false },
            { col: "Project", req: false },
            { col: "Positions", req: false },
            { col: "Priority", req: false },
            { col: "Status", req: false },
            { col: "Date Received", req: false },
            { col: "Date Closed", req: false },
            { col: "Min Exp", req: false },
            { col: "Max Exp", req: false },
            { col: "Preferred Skills", req: false },
            { col: "Responsibilities", req: false },
          ].map(({ col, req }) => (
            <span
              key={col}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                req
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {col}{req && " *"}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          * Required. Column order doesn&apos;t matter. Client must match an existing client name or code.
        </p>
      </div>

      {/* Upload zone */}
      {stage !== "done" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-[28px] border-2 border-dashed transition-all p-10 flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? "border-slate-700 bg-slate-100"
              : file
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {file ? (
            <>
              <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
              <p className="text-sm font-extrabold text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB — click to change file</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-slate-400" />
              <p className="text-sm font-bold text-slate-700">Drop your spreadsheet here</p>
              <p className="text-xs text-slate-400">or click to browse — .xlsx, .xls, .csv supported</p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-sm font-bold text-rose-700">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Action buttons */}
      {file && stage === "idle" && (
        <div className="flex justify-end">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E1E1E] text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-sm"
          >
            <ChevronRight className="w-4 h-4" /> Preview Rows
          </button>
        </div>
      )}

      {/* Preview table */}
      {(stage === "previewing" || stage === "importing") && preview.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs px-5 py-3 text-sm">
            <span className="flex items-center gap-1.5 font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> {validRows.length} valid
            </span>
            {invalidRows.length > 0 && (
              <span className="flex items-center gap-1.5 font-bold text-rose-600">
                <XCircle className="w-4 h-4" /> {invalidRows.length} with errors (will be skipped)
              </span>
            )}
            <span className="ml-auto text-xs text-slate-400">{preview.length} total rows parsed</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50">
                  <tr>
                    <th className="py-3 px-4">Row</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">JD Code</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Discipline</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Positions</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Date Received</th>
                    <th className="py-3 px-4">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.map((row) => (
                    <tr
                      key={row.rowNum}
                      className={row.errors.length > 0 ? "bg-rose-50/50" : "hover:bg-slate-50/60"}
                    >
                      <td className="py-2.5 px-4 text-slate-400 font-mono">{row.rowNum}</td>
                      <td className="py-2.5 px-4">
                        {row.errors.length === 0 ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-600 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Error
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{row.data.jobCode || "—"}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 max-w-[160px] truncate">{row.data.title || "—"}</td>
                      <td className="py-2.5 px-4 text-slate-600">{row.data.discipline || "—"}</td>
                      <td className="py-2.5 px-4 text-slate-600">{row.data.location || "—"}</td>
                      <td className="py-2.5 px-4 text-center font-semibold">{row.data.numPositions}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          row.data.priority === "URGENT" ? "bg-rose-100 text-rose-700" :
                          row.data.priority === "HIGH" ? "bg-red-100 text-red-700" :
                          row.data.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {row.data.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                        {row.data.dateReceived ?? "—"}
                      </td>
                      <td className="py-2.5 px-4 text-rose-600 text-[11px] max-w-[200px]">
                        {row.errors.length > 0 ? row.errors.join("; ") : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import button */}
          {validRows.length > 0 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setStage("idle"); setPreview([]); }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Change file
              </button>
              <button
                onClick={handleImport}
                disabled={stage === "importing"}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E1E1E] text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-60 transition-all shadow-sm"
              >
                {stage === "importing" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
                ) : (
                  <><Upload className="w-4 h-4" /> Import {validRows.length} Job{validRows.length !== 1 ? "s" : ""}</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Done state */}
      {stage === "done" && result && (
        <div className="space-y-4">
          <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-2xs p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Import Complete</h3>
              <p className="text-sm text-slate-500 mt-1">
                <strong className="text-emerald-700">{result.inserted} JDs</strong> successfully imported
                {result.skipped > 0 && (
                  <>, <strong className="text-rose-600">{result.skipped} rows</strong> skipped due to errors</>
                )}.
              </p>
            </div>

            {result.invalidRows.length > 0 && (
              <div className="w-full text-left bg-rose-50 rounded-2xl border border-rose-200 p-4 space-y-2">
                <p className="text-xs font-extrabold text-rose-700 uppercase tracking-wider">Skipped Rows</p>
                {result.invalidRows.map((r) => (
                  <div key={r.rowNum} className="text-xs text-rose-600">
                    Row {r.rowNum}: {r.errors.join("; ")}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => { setFile(null); setStage("idle"); setPreview([]); setResult(null); setError(null); }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Import Another File
              </button>
              <Link
                href="/admin/jobs"
                className="px-5 py-2.5 rounded-xl bg-[#1E1E1E] text-white text-sm font-bold hover:bg-slate-800 transition-all"
              >
                View Job Descriptions →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
