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
  | "teal";

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
    if (s === "DRAFT") resolvedVariant = "gray";
    else if (s === "SUBMITTED") resolvedVariant = "blue";
    else if (s === "UNDER_REVIEW" || s === "FEEDBACK_PENDING") resolvedVariant = "yellow";
    else if (s === "SHORTLISTED") resolvedVariant = "purple";
    else if (s === "INTERVIEW_SCHEDULED" || s === "INTERVIEWED") resolvedVariant = "indigo";
    else if (s === "SELECTED" || s === "OFFER_ACCEPTED" || s === "JOINED") resolvedVariant = "green";
    else if (s === "REJECTED" || s === "CLOSED" || s === "WITHDRAWN") resolvedVariant = "red";
    else if (s === "ON_HOLD") resolvedVariant = "orange";
    else if (s === "HIGH" || s === "URGENT") resolvedVariant = "red";
    else if (s === "MEDIUM") resolvedVariant = "yellow";
    else if (s === "LOW") resolvedVariant = "gray";
  }

  const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
    gray: { bg: "bg-[#ECECEC] text-slate-700 border-[#D6D6D6]", dot: "bg-slate-500" },
    blue: { bg: "bg-[#E5E5FF] text-[#4A4AFF] border-[#D6D6FF]", dot: "bg-[#4A4AFF]" },
    yellow: { bg: "bg-[#FFF4D9] text-[#B78103] border-[#FFE082]", dot: "bg-[#B78103]" },
    green: { bg: "bg-[#E4F8E5] text-[#2E7D32] border-[#C8E6C9]", dot: "bg-[#2E7D32]" },
    red: { bg: "bg-[#FFE5E5] text-[#D32F2F] border-[#FFCDD2]", dot: "bg-[#D32F2F]" },
    purple: { bg: "bg-[#E5E5FF] text-[#4A4AFF] border-[#D6D6FF]", dot: "bg-[#4A4AFF]" },
    indigo: { bg: "bg-[#E5E5FF] text-[#4A4AFF] border-[#D6D6FF]", dot: "bg-[#4A4AFF]" },
    orange: { bg: "bg-[#FFF4D9] text-[#B78103] border-[#FFE082]", dot: "bg-[#B78103]" },
    teal: { bg: "bg-[#E4F8E5] text-[#2E7D32] border-[#C8E6C9]", dot: "bg-[#2E7D32]" },
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
