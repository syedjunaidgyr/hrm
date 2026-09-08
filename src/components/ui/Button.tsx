import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center font-extrabold tracking-tight transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-2xs active:scale-[0.98]";

  const variants = {
    primary:
      "bg-[#1E1E1E] hover:bg-slate-800 text-white focus:ring-slate-900 border border-transparent shadow-xs",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 border border-slate-200/80 shadow-2xs",
    outline:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs focus:ring-[#1E1E1E]",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 border border-transparent shadow-xs",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 border border-transparent shadow-xs",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 shadow-none focus:ring-slate-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs font-extrabold gap-2",
    lg: "px-5 py-2.5 text-sm font-extrabold gap-2.5",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
