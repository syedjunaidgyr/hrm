"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { Upload, Plus, Send } from "lucide-react";

interface CandidateModalFormProps {
  jobs: Array<{ id: string; title: string; jobCode: string; vendorName: string }>;
  defaultJobId?: string;
  onSuccess?: () => void;
  buttonLabel?: string;
  buttonVariant?: "primary" | "secondary" | "outline";
}

export const CandidateModalForm: React.FC<CandidateModalFormProps> = ({
  jobs,
  defaultJobId,
  onSuccess,
  buttonLabel = "Create Candidate & Submit",
  buttonVariant = "primary",
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  const initialJobId = defaultJobId && jobs.some((j) => j.id === defaultJobId) ? defaultJobId : jobs[0]?.id || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    totalExperience: "",
    relevantExperience: "",
    currentCompany: "",
    currentDesignation: "",
    currentLocation: "",
    preferredLocation: "",
    skills: "",
    noticePeriod: "",
    currentSalary: "",
    expectedSalary: "",
    source: "",
    recruiter: "",
    notes: "",
    selectedJobId: initialJobId,
  });

  React.useEffect(() => {
    if (defaultJobId && jobs.some((j) => j.id === defaultJobId)) {
      setFormData((prev) => ({ ...prev, selectedJobId: defaultJobId }));
    }
  }, [defaultJobId, jobs]);

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setToast({ type: "error", title: "Validation Error", message: "Candidate resume file is required." });
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      data.append("resume", resumeFile);

      const res = await fetch("/api/candidates/create-and-submit", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setToast({ type: "error", title: "Submission Failed", message: result.error?.message || "Failed to create candidate." });
        setIsLoading(false);
        return;
      }

      setToast({ type: "success", title: "Candidate Submitted Successfully", message: "Candidate created & submitted to vendor JD." });
      setIsLoading(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        totalExperience: "",
        relevantExperience: "",
        currentCompany: "",
        currentDesignation: "",
        currentLocation: "",
        preferredLocation: "",
        skills: "",
        noticePeriod: "",
        currentSalary: "",
        expectedSalary: "",
        source: "",
        recruiter: "",
        notes: "",
        selectedJobId: initialJobId,
      });
      setResumeFile(null);
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err) {
      setToast({ type: "error", title: "Network Error", message: "Failed to communicate with server." });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant={buttonVariant} onClick={() => setIsOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
        {buttonLabel}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Candidate & Submit to Job" maxWidth="2xl">
        {toast && (
          <div className="mb-4">
            <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {defaultJobId && jobs.find((j) => j.id === formData.selectedJobId) ? (
            <div className="bg-brand-50 border border-brand-200 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase text-brand-700 tracking-wider">
                  Target Job Description (Autoselected)
                </span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {jobs.find((j) => j.id === formData.selectedJobId)?.jobCode} -{" "}
                  {jobs.find((j) => j.id === formData.selectedJobId)?.title} (
                  {jobs.find((j) => j.id === formData.selectedJobId)?.vendorName})
                </p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-brand-600 text-white rounded-md shadow-xs">
                Target Job
              </span>
            </div>
          ) : (
            <div className="bg-brand-50/60 p-3 rounded-lg border border-brand-200">
              <Select
                label="Select Target Job Description"
                required
                value={formData.selectedJobId}
                onChange={(e) => setFormData({ ...formData, selectedJobId: e.target.value })}
                options={jobs.map((j) => ({
                  value: j.id,
                  label: `${j.jobCode} - ${j.title} (${j.vendorName})`,
                }))}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Candidate Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Total Experience (Years)"
              type="number"
              step="0.1"
              required
              value={formData.totalExperience}
              onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
            />
            <Input
              label="Current Company"
              value={formData.currentCompany}
              onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
            />
            <Input
              label="Current Designation"
              value={formData.currentDesignation}
              onChange={(e) => setFormData({ ...formData, currentDesignation: e.target.value })}
            />
            <Input
              label="Current Location"
              value={formData.currentLocation}
              onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
            />
            <Input
              label="Notice Period"
              value={formData.noticePeriod}
              onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
            />
          </div>

          <Textarea
            label="Required Skills"
            required
            rows={2}
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />

          <div className="border border-dashed border-slate-300 p-4 rounded-xl text-center bg-slate-50">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Upload Resume (PDF, DOC, DOCX) *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              required
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-700 cursor-pointer"
            />
            {resumeFile && (
              <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} rightIcon={<Send className="w-4 h-4" />}>
              Submit Candidate
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
