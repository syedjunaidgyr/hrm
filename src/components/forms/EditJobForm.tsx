"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DropdownItem { id: string; name: string; }

interface JobData {
  id: string;
  title: string;
  department: string | null;
  disciplineId: string | null;
  projectId: string | null;
  location: string;
  employmentType: string;
  workMode: string;
  minExperience: number;
  maxExperience: number;
  numPositions: number;
  deliveredQty: number;
  minSalary: string | null;
  maxSalary: string | null;
  requiredSkills: string;
  preferredSkills: string | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  noticePeriod: string | null;
  priority: string;
  status: string;
  dateReceived: string | null;
  dateClosed: string | null;
  additionalNotes: string | null;
}

interface Props {
  job: JobData;
  /** API endpoint to PATCH, e.g. /api/vendor/jobs/[id] or /api/admin/jobs/[id] */
  patchUrl: string;
  /** Where to redirect after save */
  backUrl: string;
  /** Show status dropdown (admins can change status; clients cannot directly) */
  showStatus?: boolean;
  /** Show client/vendor assignment (admin-only) */
  showAdminFields?: boolean;
}

export const EditJobForm: React.FC<Props> = ({
  job,
  patchUrl,
  backUrl,
  showStatus = true,
  showAdminFields = false,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);
  const [disciplines, setDisciplines] = useState<DropdownItem[]>([]);
  const [projects, setProjects] = useState<DropdownItem[]>([]);
  const [jobTitles, setJobTitles] = useState<DropdownItem[]>([]);
  const [jdStatuses, setJdStatuses] = useState<{ code: string; description: string }[]>([
    { code: "PENDING", description: "Pending" },
    { code: "WIP", description: "WIP" },
    { code: "ON_HOLD", description: "On Hold" },
    { code: "COMPLETED", description: "Completed" },
    { code: "CANCELLED", description: "Cancelled" },
  ]);

  const toDateInput = (val: string | null | undefined) => {
    if (!val) return "";
    try { return new Date(val).toISOString().slice(0, 10); } catch { return ""; }
  };

  const [form, setForm] = useState({
    title: job.title,
    disciplineId: job.disciplineId ?? "",
    department: job.department ?? "",
    projectId: job.projectId ?? "",
    location: job.location,
    employmentType: job.employmentType,
    workMode: job.workMode,
    minExperience: job.minExperience,
    maxExperience: job.maxExperience,
    numPositions: job.numPositions,
    deliveredQty: job.deliveredQty,
    minSalary: job.minSalary ?? "",
    maxSalary: job.maxSalary ?? "",
    requiredSkills: job.requiredSkills,
    preferredSkills: job.preferredSkills ?? "",
    description: job.description,
    responsibilities: job.responsibilities ?? "",
    requirements: job.requirements ?? "",
    noticePeriod: job.noticePeriod ?? "",
    priority: job.priority,
    status: job.status,
    dateReceived: toDateInput(job.dateReceived),
    dateClosed: toDateInput(job.dateClosed),
    additionalNotes: job.additionalNotes ?? "",
  });

  useEffect(() => {
    fetch("/api/dropdowns")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setDisciplines(data.disciplines ?? []);
          setProjects(data.projects ?? []);
          setJobTitles(data.jobTitles ?? []);
          if (data.jdStatuses?.length) setJdStatuses(data.jdStatuses);
        }
      });
  }, []);

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) { setToast({ type: "error", title: "Title is required." }); return; }
    if (!form.description.trim()) { setToast({ type: "error", title: "Description is required." }); return; }
    if (!form.requiredSkills.trim()) { setToast({ type: "error", title: "Required skills are needed." }); return; }
    if (!form.location.trim()) { setToast({ type: "error", title: "Location is required." }); return; }

    setIsLoading(true);
    setToast(null);

    try {
      const payload = {
        ...form,
        department: form.disciplineId
          ? (disciplines.find((d) => d.id === form.disciplineId)?.name ?? form.department)
          : form.department,
        minSalary: form.minSalary || null,
        maxSalary: form.maxSalary || null,
        dateReceived: form.dateReceived || null,
        dateClosed: form.dateClosed || null,
        disciplineId: form.disciplineId || null,
        projectId: form.projectId || null,
      };

      const res = await fetch(patchUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setToast({ type: "error", title: "Save Failed", message: data.error?.message || "Failed to update." });
        setIsLoading(false);
        return;
      }

      setToast({ type: "success", title: "Saved", message: "Job Description updated successfully." });
      setTimeout(() => { router.push(backUrl); router.refresh(); }, 800);
    } catch {
      setToast({ type: "error", title: "Network Error", message: "Failed to connect to server." });
      setIsLoading(false);
    }
  };

  const citySuggestions = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Dubai", "Abu Dhabi", "London", "Singapore", "Remote"];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={backUrl} className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Job Description</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{job.id.slice(0, 8)}…</p>
          </div>
        </div>
        <Button type="button" isLoading={isLoading} onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
          Save Changes
        </Button>
      </div>

      {toast && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />}

      <form className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-2xs space-y-6">
        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Job Title *" required value={form.title} onChange={(e) => set("title", e.target.value)} />
          {jobTitles.length > 0 && (
            <Select
              label="Or pick from Job Titles"
              value={jobTitles.some((t) => t.name === form.title) ? form.title : ""}
              onChange={(e) => e.target.value && set("title", e.target.value)}
              options={[
                { value: "", label: "— Select from master —" },
                ...jobTitles.map((t) => ({ value: t.name, label: t.name })),
              ]}
            />
          )}

          {disciplines.length > 0 ? (
            <Select
              label="Discipline"
              value={form.disciplineId}
              onChange={(e) => set("disciplineId", e.target.value)}
              options={[{ value: "", label: "— Select Discipline —" }, ...disciplines.map((d) => ({ value: d.id, label: d.name }))]}
            />
          ) : (
            <Input label="Discipline" value={form.department} onChange={(e) => set("department", e.target.value)} />
          )}

          {projects.length > 0 && (
            <Select
              label="Project"
              value={form.projectId}
              onChange={(e) => set("projectId", e.target.value)}
              options={[{ value: "", label: "— Select Project —" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
            />
          )}

          {/* Location with datalist */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-extrabold text-slate-700">Location *</label>
            <input
              list="edit-city-suggestions"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Sydney"
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
            <datalist id="edit-city-suggestions">{citySuggestions.map((c) => <option key={c} value={c} />)}</datalist>
          </div>

          <Select label="Employment Type" value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}
            options={[{ value: "FULL_TIME", label: "Full Time" }, { value: "PART_TIME", label: "Part Time" }, { value: "CONTRACT", label: "Contract" }, { value: "INTERNSHIP", label: "Internship" }]}
          />
          <Select label="Work Mode" value={form.workMode} onChange={(e) => set("workMode", e.target.value)}
            options={[{ value: "ON_SITE", label: "On-Site" }, { value: "HYBRID", label: "Hybrid" }, { value: "REMOTE", label: "Remote" }]}
          />
          <Select label="Priority" value={form.priority} onChange={(e) => set("priority", e.target.value)}
            options={[{ value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" }, { value: "HIGH", label: "High" }, { value: "URGENT", label: "Urgent" }]}
          />
          {showStatus && (
            <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}
              options={jdStatuses.map((s) => ({ value: s.code, label: s.description }))}
            />
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <Input label="Date Received" type="date" value={form.dateReceived} onChange={(e) => set("dateReceived", e.target.value)} />
          <Input label="Date Closed" type="date" value={form.dateClosed} onChange={(e) => set("dateClosed", e.target.value)} />
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <Input label="Min Experience (Yrs)" type="number" value={form.minExperience} onChange={(e) => set("minExperience", parseInt(e.target.value) || 0)} />
          <Input label="Max Experience (Yrs)" type="number" value={form.maxExperience} onChange={(e) => set("maxExperience", parseInt(e.target.value) || 0)} />
          <Input label="No. of Positions" type="number" value={form.numPositions} onChange={(e) => set("numPositions", parseInt(e.target.value) || 1)} />
          <Input label="Delivered Qty" type="number" value={form.deliveredQty} onChange={(e) => set("deliveredQty", parseInt(e.target.value) || 0)} />
        </div>

        {/* Salary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Min Salary / Budget" type="number" value={form.minSalary} onChange={(e) => set("minSalary", e.target.value)} />
          <Input label="Max Salary / Budget" type="number" value={form.maxSalary} onChange={(e) => set("maxSalary", e.target.value)} />
        </div>

        <Input label="Notice Period" value={form.noticePeriod} onChange={(e) => set("noticePeriod", e.target.value)} />

        <Textarea label="Required Skills (comma-separated) *" required rows={2} value={form.requiredSkills} onChange={(e) => set("requiredSkills", e.target.value)} />
        <Textarea label="Preferred Skills" rows={2} value={form.preferredSkills} onChange={(e) => set("preferredSkills", e.target.value)} />
        <Textarea label="Job Description *" required rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        <Textarea label="Key Responsibilities" rows={3} value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} />
        <Textarea label="Requirements" rows={3} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
        <Textarea label="Additional Notes" rows={2} value={form.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} />
      </form>
    </div>
  );
};
