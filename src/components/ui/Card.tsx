import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[32px] border border-slate-200/60 shadow-2xs p-6 transition-all duration-200 ${
        hoverEffect || onClick ? "hover-lift cursor-pointer hover:border-slate-300" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, subtitle, action, icon }) => (
  <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-100/80">
    <div className="flex items-center gap-2.5">
      {icon && (
        <div className="p-2 rounded-xl bg-blue-50 text-[#0C54D9] border border-blue-100 shrink-0">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);
