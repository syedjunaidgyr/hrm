import React from "react";

export type BadgeVariant =
  | "gray"
  | "blue"
  | "yellow"
  | "green"
  | "red"
  | "purple"
  | "indigo"
  | "orange"
  | "teal"
  | "emerald"
  | "rose"
  | "sky";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  status?: string;
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = "md",
  className = "",
}) => {
  let resolvedVariant: BadgeVariant = variant || "gray";

  if (status) {
    const s = status.toUpperCase();

    // ── Job / JD statuses ─────────────────────────────────────────────
    if (s === "PENDING") resolvedVariant = "gray";
    else if (s === "WIP") resolvedVariant = "blue";
    else if (s === "COMPLETED") resolvedVariant = "green";
    else if (s === "CANCELLED") resolvedVariant = "red";

    // ── Legacy JD statuses (keep compat) ──────────────────────────────
    else if (s === "DRAFT") resolvedVariant = "gray";
    else if (s === "SUBMITTED") resolvedVariant = "blue";
    else if (s === "CLOSED") resolvedVariant = "red";

    // ── New 10-state candidate lifecycle ─────────────────────────────
    else if (s === "NEW") resolvedVariant = "sky";
    else if (s === "VIEWED") resolvedVariant = "indigo";
    else if (s === "REJECTED_L1") resolvedVariant = "orange";
    else if (s === "INTERVIEW_SCHEDULED") resolvedVariant = "purple";
    else if (s === "INTERVIEW_COMPLETED") resolvedVariant = "teal";
    else if (s === "REJECTED_L2") resolvedVariant = "rose";
    else if (s === "PROGRESSED") resolvedVariant = "blue";
    else if (s === "ONBOARDED") resolvedVariant = "emerald";
    else if (s === "BILLED") resolvedVariant = "green";

    // ── Legacy candidate statuses (keep compat) ───────────────────────
    else if (s === "UNDER_REVIEW" || s === "FEEDBACK_PENDING") resolvedVariant = "yellow";
    else if (s === "SHORTLISTED") resolvedVariant = "purple";
    else if (s === "INTERVIEW_DATETIME" || s === "INTERVIEWED") resolvedVariant = "indigo";
    else if (s === "SELECTED" || s === "OFFER_ACCEPTED" || s === "JOINED") resolvedVariant = "green";
    else if (s === "REJECTED" || s === "WITHDRAWN") resolvedVariant = "red";
    else if (s === "ON_HOLD") resolvedVariant = "orange";

    // ── Priority ──────────────────────────────────────────────────────
    else if (s === "URGENT") resolvedVariant = "rose";
    else if (s === "HIGH") resolvedVariant = "red";
    else if (s === "MEDIUM") resolvedVariant = "yellow";
    else if (s === "LOW") resolvedVariant = "gray";

    // ── Vendor/Client status ──────────────────────────────────────────
    else if (s === "ACTIVE") resolvedVariant = "green";
    else if (s === "INACTIVE") resolvedVariant = "gray";
  }

  const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
    gray:    { bg: "bg-[#ECECEC] text-slate-700 border-[#D6D6D6]",     dot: "bg-slate-500" },
    blue:    { bg: "bg-[#E5EEFF] text-[#2856C8] border-[#C3D4FF]",     dot: "bg-[#2856C8]" },
    sky:     { bg: "bg-[#E0F4FF] text-[#0369A1] border-[#BAE6FD]",     dot: "bg-[#0369A1]" },
    indigo:  { bg: "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]",     dot: "bg-[#4338CA]" },
    purple:  { bg: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]",     dot: "bg-[#7C3AED]" },
    teal:    { bg: "bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]",     dot: "bg-[#0F766E]" },
    emerald: { bg: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",     dot: "bg-[#047857]" },
    green:   { bg: "bg-[#E4F8E5] text-[#2E7D32] border-[#C8E6C9]",     dot: "bg-[#2E7D32]" },
    yellow:  { bg: "bg-[#FFF4D9] text-[#B78103] border-[#FFE082]",     dot: "bg-[#B78103]" },
    orange:  { bg: "bg-[#FFF3E0] text-[#E65100] border-[#FFCC80]",     dot: "bg-[#E65100]" },
    red:     { bg: "bg-[#FFE5E5] text-[#D32F2F] border-[#FFCDD2]",     dot: "bg-[#D32F2F]" },
    rose:    { bg: "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]",     dot: "bg-[#BE123C]" },
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-[11px] font-semibold gap-1.5",
    md: "px-3 py-1 text-xs font-extrabold gap-1.5",
  };

  const currentStyle = variantStyles[resolvedVariant];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs transition-all ${currentStyle.bg} ${sizes[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot} shrink-0 animate-pulse`} />
      <span>{children}</span>
    </span>
  );
};
