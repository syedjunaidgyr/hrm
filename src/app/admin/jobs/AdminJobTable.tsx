"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { FileText, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

type SortDir = "asc" | "desc" | null;
type SortKey =
  | "jobCode"
  | "dateReceived"
  | "client"
  | "project"
  | "discipline"
  | "title"
  | "location"
  | "numPositions"
  | "priority"
  | "status"
  | "cvs";

interface JobRow {
  id: string;
  jobCode: string;
  title: string;
  location: string;
  numPositions: number;
  priority: string;
  status: string;
  dateReceived: string | null;
  department: string | null;
  vendorName: string;
  projectName: string;
  disciplineName: string;
  submissionCount: number;
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 text-slate-400 inline ml-1" />;
  if (sortDir === "asc") return <ChevronUp className="w-3 h-3 text-slate-700 inline ml-1" />;
  return <ChevronDown className="w-3 h-3 text-slate-700 inline ml-1" />;
}

export function AdminJobTable({ jobs }: { jobs: JobRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return jobs;
    return [...jobs].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      switch (sortKey) {
        case "jobCode":
          av = a.jobCode;
          bv = b.jobCode;
          break;
        case "dateReceived":
          av = a.dateReceived || "";
          bv = b.dateReceived || "";
          break;
        case "client":
          av = a.vendorName;
          bv = b.vendorName;
          break;
        case "project":
          av = a.projectName;
          bv = b.projectName;
          break;
        case "discipline":
          av = a.disciplineName;
          bv = b.disciplineName;
          break;
        case "title":
          av = a.title;
          bv = b.title;
          break;
        case "location":
          av = a.location;
          bv = b.location;
          break;
        case "numPositions":
          av = a.numPositions;
          bv = b.numPositions;
          break;
        case "priority":
          av = a.priority;
          bv = b.priority;
          break;
        case "status":
          av = a.status;
          bv = b.status;
          break;
        case "cvs":
          av = a.submissionCount;
          bv = b.submissionCount;
          break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [jobs, sortKey, sortDir]);

  const th = (label: string, key: SortKey, alignRight = false) => (
    <th
      className={`py-3 px-4 cursor-pointer select-none hover:text-slate-700 ${alignRight ? "text-right" : ""}`}
      onClick={() => handleSort(key)}
    >
      {label}
      <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-700 border-collapse">
        <thead className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
          <tr>
            {th("JD Code", "jobCode")}
            {th("Date Received", "dateReceived")}
            {th("Client", "client")}
            {th("Project", "project")}
            {th("Discipline", "discipline")}
            {th("Job Title", "title")}
            {th("Location", "location")}
            {th("Positions", "numPositions")}
            {th("Priority", "priority")}
            {th("Status", "status")}
            {th("CVs", "cvs", true)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={11} className="py-10 text-center text-slate-500 font-medium">
                No Job Descriptions found.
              </td>
            </tr>
          ) : (
            sorted.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="font-mono text-xs font-bold text-blue-600 hover:underline"
                  >
                    {job.jobCode}
                  </Link>
                </td>
                <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                  {job.dateReceived ? new Date(job.dateReceived).toLocaleDateString() : "—"}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">{job.vendorName}</td>
                <td className="py-3.5 px-4 text-slate-600">{job.projectName}</td>
                <td className="py-3.5 px-4 text-slate-600">{job.disciplineName}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{job.title}</td>
                <td className="py-3.5 px-4 text-slate-600">{job.location}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 text-center">{job.numPositions}</td>
                <td className="py-3.5 px-4">
                  <Badge status={job.priority}>{job.priority}</Badge>
                </td>
                <td className="py-3.5 px-4">
                  <Badge status={job.status}>{job.status}</Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-300/80 text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {job.submissionCount} CVs
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
