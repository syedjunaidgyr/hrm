import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export interface ToastProps {
  type?: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type = "info", title, message, onClose }) => {
  const styles = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-900",
      icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-900",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-md transition-all ${styles[type].bg}`}>
      {styles[type].icon}
      <div className="flex-1">
        <h4 className="text-sm font-semibold">{title}</h4>
        {message && <p className="text-xs opacity-90 mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 p-0.5">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
