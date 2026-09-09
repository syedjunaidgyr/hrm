"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { Star, CheckCircle2 } from "lucide-react";

interface VendorActionFormsProps {
  submissionId: string;
  currentStatus: string;
}

export const VendorActionForms: React.FC<VendorActionFormsProps> = ({
  submissionId,
  currentStatus,
}) => {
  const router = useRouter();
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  // Status transition form state — new 10-state lifecycle
  const [targetStatus, setTargetStatus] = useState("VIEWED");
  const [statusReason, setStatusReason] = useState("");

  // Structured Feedback form state
  const [feedbackData, setFeedbackData] = useState({
    overallRating: 5,
    technicalRating: 5,
    communicationRating: 5,
    experienceFit: 5,
    strengths: "",
    concerns: "",
    comments: "",
    recommendation: "PROCEED_TO_INTERVIEW",
  });

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStatusLoading(true);
    setToast(null);

    try {
      const res = await fetch(`/api/vendor/submissions/${submissionId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus, reason: statusReason }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setToast({ type: "error", title: "Status Update Failed", message: data.error?.message || "Failed to update status." });
        setIsStatusLoading(false);
        return;
      }

      setToast({ type: "success", title: "Status Updated", message: `Candidate status updated to ${targetStatus}.` });
      setIsStatusLoading(false);
      router.refresh();
    } catch (err) {
      setToast({ type: "error", title: "Error", message: "Failed to connect to server." });
      setIsStatusLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFeedbackLoading(true);
    setToast(null);

    try {
      const res = await fetch(`/api/vendor/submissions/${submissionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setToast({ type: "error", title: "Feedback Submission Failed", message: data.error?.message || "Failed to submit feedback." });
        setIsFeedbackLoading(false);
        return;
      }

      setToast({ type: "success", title: "Feedback Saved", message: "Vendor structured feedback recorded." });
      setIsFeedbackLoading(false);
      router.refresh();
    } catch (err) {
      setToast({ type: "error", title: "Error", message: "Failed to connect to server." });
      setIsFeedbackLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />}

      {/* Candidate Status Transition Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-600" />
          Update Recruitment Status
        </h3>
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Update Status To"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              options={[
                { value: "VIEWED", label: "Viewed" },
                { value: "REJECTED_L1", label: "Rejected (Initial)" },
                { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
                { value: "INTERVIEW_COMPLETED", label: "Interview Completed" },
                { value: "REJECTED_L2", label: "Rejected (Post-Interview)" },
                { value: "PROGRESSED", label: "Progressed" },
                { value: "ONBOARDED", label: "Onboarded" },
                { value: "BILLED", label: "Billed" },
              ]}
            />
            <Textarea
              label="Reason / Status Notes"
              placeholder="e.g. Candidate resume fits technical requirements..."
              rows={1}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={isStatusLoading} className="w-full">
            Apply Status Transition
          </Button>
        </form>
      </div>

      {/* Structured Vendor Feedback Form Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          Submit Structured Vendor Feedback
        </h3>
        <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <Select
              label="Overall (1-5)"
              value={feedbackData.overallRating.toString()}
              onChange={(e) => setFeedbackData({ ...feedbackData, overallRating: parseInt(e.target.value, 10) })}
              options={["1", "2", "3", "4", "5"].map((n) => ({ value: n, label: `${n} Stars` }))}
            />
            <Select
              label="Technical (1-5)"
              value={feedbackData.technicalRating.toString()}
              onChange={(e) => setFeedbackData({ ...feedbackData, technicalRating: parseInt(e.target.value, 10) })}
              options={["1", "2", "3", "4", "5"].map((n) => ({ value: n, label: `${n} Stars` }))}
            />
            <Select
              label="Comm (1-5)"
              value={feedbackData.communicationRating.toString()}
              onChange={(e) => setFeedbackData({ ...feedbackData, communicationRating: parseInt(e.target.value, 10) })}
              options={["1", "2", "3", "4", "5"].map((n) => ({ value: n, label: `${n} Stars` }))}
            />
            <Select
              label="Experience Fit (1-5)"
              value={feedbackData.experienceFit.toString()}
              onChange={(e) => setFeedbackData({ ...feedbackData, experienceFit: parseInt(e.target.value, 10) })}
              options={["1", "2", "3", "4", "5"].map((n) => ({ value: n, label: `${n} Stars` }))}
            />
          </div>

          <Select
            label="Vendor Recommendation"
            value={feedbackData.recommendation}
            onChange={(e) => setFeedbackData({ ...feedbackData, recommendation: e.target.value as any })}
            options={[
              { value: "PROCEED_TO_INTERVIEW", label: "Proceed to Interview" },
              { value: "PROCEED_TO_NEXT_ROUND", label: "Proceed to Next Round" },
              { value: "KEEP_ON_HOLD", label: "Keep On Hold" },
              { value: "REJECT", label: "Reject Candidate" },
            ]}
          />

          <Textarea
            label="Candidate Strengths"
            rows={2}
            value={feedbackData.strengths}
            onChange={(e) => setFeedbackData({ ...feedbackData, strengths: e.target.value })}
          />

          <Textarea
            label="Candidate Concerns / Gaps"
            rows={2}
            value={feedbackData.concerns}
            onChange={(e) => setFeedbackData({ ...feedbackData, concerns: e.target.value })}
          />

          <Textarea
            label="Additional Comments"
            rows={2}
            value={feedbackData.comments}
            onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
          />

          <Button type="submit" isLoading={isFeedbackLoading} variant="secondary" className="w-full">
            Submit Candidate Feedback
          </Button>
        </form>
      </div>
    </div>
  );
};
