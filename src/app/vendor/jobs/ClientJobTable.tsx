"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Filter, Sparkles } from "lucide-react";

type SortDir = "asc" | "desc" | null;
type SortKey =
  | "jobCode"
  | "dateReceived"
  | "project"
  | "discipline"
  | "title"
  | "location"
  | "numPositions"
  | "submissionCount"
  | "pendingCount"
  | "priority"
  | "status";

interface Submission {
  id: string;
  status: string;
  candidate: { id: string; name: string; currentDesignation: string | null };
  resumeFile: { id: string; fileName: string } | null;
}

interface Job {
  id: string;
  jobCode: string;
  title: string;
  location: string;
  numPositions: number;
  deliveredQty: number;
  priority: string;
  status: string;
  dateReceived: string | null;
  department: string | null;
  discipline: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  submissions: Submission[];
}

interface Props {
  jobs: Job[];
  disciplines: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 text-slate-400 inline ml-1" />;
  if (sortDir === "asc") return <ChevronUp className="w-3 h-3 text-slate-700 inline ml-1" />;
  return <ChevronDown className="w-3 h-3 text-slate-700 inline ml-1" />;
}

export function ClientJobTable({ jobs, disciplines, projects }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [newCvsOnly, setNewCvsOnly] = useState(false);
  const [filterDiscipline, setFilterDiscipline] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let list = [...jobs];
    if (newCvsOnly) {
      list = list.filter((j) => j.submissions.some((s) => s.status === "NEW"));
    }
    if (filterDiscipline) {
      list = list.filter((j) => j.discipline?.id === filterDiscipline);
    }
    if (filterProject) {
      list = list.filter((j) => j.project?.id === filterProject);
    }
    if (filterStatus) {
      list = list.filter((j) => j.status === filterStatus);
    }
    if (filterPriority) {
      list = list.filter((j) => j.priority === filterPriority);
    }
    return list;
  }, [jobs, newCvsOnly, filterDiscipline, filterProject, filterStatus, filterPriority]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortKey === "jobCode") { av = a.jobCode; bv = b.jobCode; }
      else if (sortKey === "dateReceived") { av = a.dateReceived ?? ""; bv = b.dateReceived ?? ""; }
      else if (sortKey === "project") { av = a.project?.name ?? ""; bv = b.project?.name ?? ""; }
      else if (sortKey === "discipline") { av = a.discipline?.name ?? a.department ?? ""; bv = b.discipline?.name ?? b.department ?? ""; }
      else if (sortKey === "title") { av = a.title; bv = b.title; }
      else if (sortKey === "location") { av = a.location; bv = b.location; }
      else if (sortKey === "numPositions") { av = a.numPositions; bv = b.numPositions; }
      else if (sortKey === "submissionCount") { av = a.submissions.length; bv = b.submissions.length; }
      else if (sortKey === "pendingCount") {
        av = a.submissions.filter((s) => s.status === "NEW").length;
        bv = b.submissions.filter((s) => s.status === "NEW").length;
      }
      else if (sortKey === "priority") { av = a.priority; bv = b.priority; }
      else if (sortKey === "status") { av = a.status; bv = b.status; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const th = (label: string, key: SortKey) => (
    <th
      className="py-3 px-4 cursor-pointer select-none whitespace-nowrap hover:text-slate-700 transition-colors"
      onClick={() => handleSort(key)}
    >
      {label}
      <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );

  const activeFilters = [filterDiscipline, filterProject, filterStatus, filterPriority].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status chips */}
            {["", "PENDING", "WIP", "CANCELLED", "COMPLETED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-black rounded-full transition-all ${
                  filterStatus === s
                    ? "bg-[#1E1E1E] text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-300/80 hover:bg-slate-50"
                }`}
              >
                {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* New CVs Only Toggle */}
          <button
            onClick={() => setNewCvsOnly((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-black rounded-full border transition-all ${
              newCvsOnly
                ? "bg-amber-400 text-amber-900 border-amber-400 shadow-2xs"
                : "bg-white text-slate-600 border-slate-300/80 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            New CVs Only
          </button>
        </div>

        {/* Secondary Filters Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {disciplines.length > 0 && (
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="text-xs font-semibold border border-slate-200 rounded-full px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="">All Disciplines</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
          {projects.length > 0 && (
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="text-xs font-semibold border border-slate-200 rounded-full px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-full px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="">All Priorities</option>
            {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
              <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
            ))}
          </select>
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterDiscipline(""); setFilterProject(""); setFilterPriority(""); }}
              className="text-xs font-bold text-rose-500 hover:underline"
            >
              Clear filters ({activeFilters})
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400 font-medium">{sorted.length} JDs</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                {th("JD Code", "jobCode")}
                {th("Date", "dateReceived")}
                {th("Project", "project")}
                {th("Discipline", "discipline")}
                {th("Job Title", "title")}
                {th("Location", "location")}
                {th("Positions", "numPositions")}
                {th("Submissions", "submissionCount")}
                {th("Pending", "pendingCount")}
                {th("Priority", "priority")}
                {th("Status", "status")}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-500 font-medium">
                    No Job Descriptions found.
                  </td>
                </tr>
              ) : (
                sorted.map((job) => {
                  const pendingCount = job.submissions.filter((s) => s.status === "NEW").length;
                  const isExpanded = expandedJobId === job.id;
                  return (
                    <React.Fragment key={job.id}>
                      <tr className={`border-b border-slate-100 transition-colors ${isExpanded ? "bg-slate-50" : "hover:bg-slate-50/60"}`}>
                        {/* JD Code — clickable */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/vendor/jobs/${job.id}`}
                            className="font-mono text-xs font-bold text-blue-600 hover:underline"
                          >
                            {job.jobCode}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {job.dateReceived ? new Date(job.dateReceived).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{job.project?.name ?? "—"}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {job.discipline?.name ?? job.department ?? "—"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{job.title}</td>
                        <td className="py-3.5 px-4 text-slate-600">{job.location}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 text-center">{job.numPositions}</td>
                        {/* Submissions — clickable to expand */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                            className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded-full transition-all ${
                              job.submissions.length > 0
                                ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                : "text-slate-400 cursor-default"
                            }`}
                          >
                            {job.submissions.length}
                            {job.submissions.length > 0 && (
                              isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          {pendingCount > 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                              {pendingCount} New
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={job.priority}>{job.priority}</Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={job.status}>{job.status}</Badge>
                        </td>
                      </tr>
                      {/* Inline CV Dropdown */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={11} className="px-6 py-0 bg-slate-50/80 border-b border-slate-100">
                            <div className="py-3 space-y-1">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                                Submitted CVs — {job.title}
                              </p>
                              {job.submissions.length === 0 ? (
                                <p className="text-xs text-slate-500 py-2">No CVs submitted yet.</p>
                              ) : (
                                job.submissions.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-slate-200/80"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {sub.candidate.name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-slate-900">{sub.candidate.name}</p>
                                        <p className="text-[10px] text-slate-500">
                                          {sub.candidate.currentDesignation ?? "Candidate"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Badge status={sub.status}>
                                        {sub.status.replace(/_/g, " ")}
                                      </Badge>
                                      <Link
                                        href={`/vendor/candidates/${sub.candidate.id}`}
                                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-300/80 text-slate-700 bg-white hover:bg-slate-50 transition-all"
                                      >
                                        <Eye className="w-3 h-3" /> View
                                      </Link>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
