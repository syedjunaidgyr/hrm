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

interface Client { id: string; name: string; code: string; }
interface DropdownItem { id: string; name: string; }

export const AdminJobForm: React.FC<{ clients: Client[] }> = ({ clients }) => {
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

  const [formData, setFormData] = useState({
    vendorId: "",
    title: "",
    disciplineId: "",
    department: "",
    projectId: "",
    location: "",
    employmentType: "FULL_TIME",
    workMode: "ON_SITE",
    minExperience: 0,
    maxExperience: 0,
    numPositions: 1,
    minSalary: "",
    maxSalary: "",
    requiredSkills: "",
    preferredSkills: "",
    description: "",
    responsibilities: "",
    noticePeriod: "",
    priority: "MEDIUM",
    status: "PENDING",
    dateReceived: "",
    dateClosed: "",
    additionalNotes: "",
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
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!formData.vendorId) { setToast({ type: "error", title: "Client required", message: "Please select a client." }); return; }
    if (!formData.title) { setToast({ type: "error", title: "Title required" }); return; }
    if (!formData.description) { setToast({ type: "error", title: "Description required" }); return; }
    if (!formData.requiredSkills) { setToast({ type: "error", title: "Required skills needed" }); return; }
    if (!formData.location) { setToast({ type: "error", title: "Location required" }); return; }

    setIsLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          department: formData.disciplineId
            ? (disciplines.find((d) => d.id === formData.disciplineId)?.name ?? formData.department)
            : formData.department,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setToast({ type: "error", title: "Error", message: data.error?.message || "Failed to create Job Description." });
        setIsLoading(false);
        return;
      }

      setToast({ type: "success", title: "Job Description Created", message: "Redirecting…" });
      setTimeout(() => { router.push("/admin/jobs"); router.refresh(); }, 1000);
    } catch {
      setToast({ type: "error", title: "Network Error", message: "Failed to connect to server." });
      setIsLoading(false);
    }
  };

  const citySuggestions = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Dubai", "Abu Dhabi", "London", "Singapore", "Remote"];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/jobs" className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Job Description</h2>
            <p className="text-xs text-slate-500 mt-0.5">Admin — create a JD on behalf of a client.</p>
          </div>
        </div>
        <Button type="button" isLoading={isLoading} onClick={handleSubmit} leftIcon={<Save className="w-4 h-4" />}>
          Create JD
        </Button>
      </div>

      {toast && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />}

      <form className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Client *"
            value={formData.vendorId}
            onChange={(e) => set("vendorId", e.target.value)}
            options={[
              { value: "", label: "— Select Client —" },
              ...clients.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` })),
            ]}
          />
          {jobTitles.length > 0 ? (
            <Select
              label="Job Title *"
              value={formData.title}
              onChange={(e) => set("title", e.target.value)}
              options={[
                { value: "", label: "— Select Job Title —" },
                ...jobTitles.map((t) => ({ value: t.name, label: t.name })),
              ]}
            />
          ) : (
            <Input label="Job Title *" required value={formData.title} onChange={(e) => set("title", e.target.value)} />
          )}

          {disciplines.length > 0 ? (
            <Select
              label="Discipline"
              value={formData.disciplineId}
              onChange={(e) => set("disciplineId", e.target.value)}
              options={[{ value: "", label: "— Select Discipline —" }, ...disciplines.map((d) => ({ value: d.id, label: d.name }))]}
            />
          ) : (
            <Input label="Discipline" value={formData.department} onChange={(e) => set("department", e.target.value)} />
          )}

          {projects.length > 0 && (
            <Select
              label="Project"
              value={formData.projectId}
              onChange={(e) => set("projectId", e.target.value)}
              options={[{ value: "", label: "— Select Project —" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
            />
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-extrabold text-slate-700">Location *</label>
            <input
              list="city-suggestions-admin"
              required
              value={formData.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Sydney"
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
            <datalist id="city-suggestions-admin">{citySuggestions.map((c) => <option key={c} value={c} />)}</datalist>
          </div>

          <Select label="Employment Type" value={formData.employmentType} onChange={(e) => set("employmentType", e.target.value)}
            options={[{ value: "FULL_TIME", label: "Full Time" }, { value: "PART_TIME", label: "Part Time" }, { value: "CONTRACT", label: "Contract" }, { value: "INTERNSHIP", label: "Internship" }]}
          />
          <Select label="Work Mode" value={formData.workMode} onChange={(e) => set("workMode", e.target.value)}
            options={[{ value: "ON_SITE", label: "On-Site" }, { value: "HYBRID", label: "Hybrid" }, { value: "REMOTE", label: "Remote" }]}
          />
          <Select label="Priority" value={formData.priority} onChange={(e) => set("priority", e.target.value)}
            options={[{ value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" }, { value: "HIGH", label: "High" }, { value: "URGENT", label: "Urgent" }]}
          />
          <Select label="Status" value={formData.status} onChange={(e) => set("status", e.target.value)}
            options={jdStatuses.map((s) => ({ value: s.code, label: s.description }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <Input label="Date Received" type="date" value={formData.dateReceived} onChange={(e) => set("dateReceived", e.target.value)} />
          <Input label="Date Closed" type="date" value={formData.dateClosed} onChange={(e) => set("dateClosed", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <Input label="Min Experience (Yrs)" type="number" value={formData.minExperience} onChange={(e) => set("minExperience", parseInt(e.target.value) || 0)} />
          <Input label="Max Experience (Yrs)" type="number" value={formData.maxExperience} onChange={(e) => set("maxExperience", parseInt(e.target.value) || 0)} />
          <Input label="No. of Positions" type="number" value={formData.numPositions} onChange={(e) => set("numPositions", parseInt(e.target.value) || 1)} />
          <Input label="Notice Period" value={formData.noticePeriod} onChange={(e) => set("noticePeriod", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Min Salary / Budget" type="number" value={formData.minSalary} onChange={(e) => set("minSalary", e.target.value)} />
          <Input label="Max Salary / Budget" type="number" value={formData.maxSalary} onChange={(e) => set("maxSalary", e.target.value)} />
        </div>

        <Textarea label="Required Skills (comma-separated) *" required rows={2} value={formData.requiredSkills} onChange={(e) => set("requiredSkills", e.target.value)} />
        <Textarea label="Preferred Skills" rows={2} value={formData.preferredSkills} onChange={(e) => set("preferredSkills", e.target.value)} />
        <Textarea label="Job Description *" required rows={4} value={formData.description} onChange={(e) => set("description", e.target.value)} />
        <Textarea label="Key Responsibilities" rows={3} value={formData.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} />
        <Textarea label="Additional Notes" rows={2} value={formData.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} />
      </form>
    </div>
  );
};
