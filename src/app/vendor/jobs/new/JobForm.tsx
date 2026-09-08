"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { Save, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const JobForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
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
    requirements: "",
    education: "",
    noticePeriod: "",
    priority: "MEDIUM",
    additionalNotes: "",
  });

  const handleAction = async (status: "DRAFT" | "SUBMITTED") => {
    setIsLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/vendor/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setToast({ type: "error", title: "Error", message: data.error?.message || "Failed to save Job Description." });
        setIsLoading(false);
        return;
      }

      setToast({
        type: "success",
        title: status === "SUBMITTED" ? "Job Description Submitted!" : "Draft Saved",
        message: status === "SUBMITTED" ? "Job is now active and open for recruitment." : "Saved as draft.",
      });

      setTimeout(() => {
        router.push("/vendor/jobs");
        router.refresh();
      }, 1000);
    } catch (err) {
      setToast({ type: "error", title: "Network Error", message: "Failed to connect to server." });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/vendor/jobs"
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Job Description</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit directly for recruitment. No Admin approval required.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => handleAction("DRAFT")}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            isLoading={isLoading}
            onClick={() => handleAction("SUBMITTED")}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Submit Job Description
          </Button>
        </div>
      </div>

      {toast && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />}

      <form className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            label="Department"
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <Input
            label="Location"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Select
            label="Employment Type"
            value={formData.employmentType}
            onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
            options={[
              { value: "FULL_TIME", label: "Full Time" },
              { value: "PART_TIME", label: "Part Time" },
              { value: "CONTRACT", label: "Contract" },
              { value: "INTERNSHIP", label: "Internship" },
            ]}
          />
          <Select
            label="Work Mode"
            value={formData.workMode}
            onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
            options={[
              { value: "ON_SITE", label: "On-Site" },
              { value: "HYBRID", label: "Hybrid" },
              { value: "REMOTE", label: "Remote" },
            ]}
          />
          <Select
            label="Priority Level"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={[
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
              { value: "URGENT", label: "Urgent" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <Input
            label="Min Experience (Yrs)"
            type="number"
            value={formData.minExperience}
            onChange={(e) => setFormData({ ...formData, minExperience: parseInt(e.target.value, 10) || 0 })}
          />
          <Input
            label="Max Experience (Yrs)"
            type="number"
            value={formData.maxExperience}
            onChange={(e) => setFormData({ ...formData, maxExperience: parseInt(e.target.value, 10) || 0 })}
          />
          <Input
            label="Number of Positions"
            type="number"
            value={formData.numPositions}
            onChange={(e) => setFormData({ ...formData, numPositions: parseInt(e.target.value, 10) || 1 })}
          />
          <Input
            label="Notice Period"
            value={formData.noticePeriod}
            onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Min Salary/Budget ($)"
            type="number"
            value={formData.minSalary}
            onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
          />
          <Input
            label="Max Salary/Budget ($)"
            type="number"
            value={formData.maxSalary}
            onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
          />
        </div>

        <Textarea
          label="Required Skills (Comma-separated)"
          required
          rows={2}
          value={formData.requiredSkills}
          onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
        />

        <Textarea
          label="Preferred Skills"
          rows={2}
          value={formData.preferredSkills}
          onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
        />

        <Textarea
          label="Job Description"
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <Textarea
          label="Key Responsibilities"
          rows={3}
          value={formData.responsibilities}
          onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
        />
      </form>
    </div>
  );
};
