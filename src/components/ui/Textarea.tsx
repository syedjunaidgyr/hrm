import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={`w-full rounded-xl border text-sm transition-all p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0C54D9]/20 ${
            error
              ? "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500"
              : "border-slate-300 bg-white text-slate-900 focus:border-[#0C54D9]"
          } ${className}`}
          rows={props.rows || 3}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
