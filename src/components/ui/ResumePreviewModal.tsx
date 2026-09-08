"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Download, Eye, FileText } from "lucide-react";

interface ResumePreviewModalProps {
  fileId: string;
  fileName: string;
  candidateName?: string;
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  triggerSize?: "sm" | "md" | "lg";
  buttonClassName?: string;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  fileId,
  fileName,
  candidateName,
  triggerLabel = "View Resume",
  triggerVariant = "primary",
  triggerSize = "sm",
  buttonClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
  const viewUrl = `/api/resumes/${fileId}/view`;
  const downloadUrl = `/api/resumes/${fileId}/download`;

  return (
    <>
      {triggerVariant === "link" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 font-bold text-xs text-[#0C54D9] hover:underline cursor-pointer ${buttonClassName}`}
        >
          <Eye className="w-3.5 h-3.5" />
          {triggerLabel}
        </button>
      ) : (
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          onClick={() => setIsOpen(true)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          className={buttonClassName}
        >
          {triggerLabel}
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={candidateName ? `Resume Preview - ${candidateName}` : `Resume Preview - ${fileName}`}
        maxWidth="4xl"
      >
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0C54D9] border border-blue-100 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                {ext.replace(".", "") || "FILE"}
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm truncate max-w-md">{fileName}</p>
                <p className="text-slate-500 mt-0.5">
                  Format: <span className="uppercase font-bold text-slate-800">{ext.replace(".", "")}</span> • Candidate:{" "}
                  <strong className="text-slate-900">{candidateName || "Candidate"}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center gap-2 font-extrabold text-xs px-4 py-2 rounded-xl bg-[#0C54D9] hover:bg-[#0A47B8] text-white shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" /> Download Resume
              </a>
            </div>
          </div>

          {/* Interactive Document Preview Frame */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 min-h-[550px] relative flex flex-col justify-center items-center shadow-inner">
            <iframe
              src={viewUrl}
              title={`Resume Preview - ${fileName}`}
              className="w-full h-[620px] border-0 rounded-xl bg-white"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Interactive document preview. Click <strong>Download Resume</strong> to save a local copy.
            </span>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Close Preview
              </Button>
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center gap-2 font-extrabold text-xs px-4 py-2 rounded-xl bg-[#0C54D9] hover:bg-[#0A47B8] text-white shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" /> Download Resume
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
