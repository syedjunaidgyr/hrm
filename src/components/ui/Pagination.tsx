import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  getPageUrl?: (page: number) => string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  getPageUrl,
}) => {
  const startRecord = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages || totalPages === 0;

  const btnClasses =
    "inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-slate-300/80 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold transition-all shadow-2xs";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 pb-1 text-xs font-sans">
      <p className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-900">{startRecord}</span> -{" "}
        <span className="font-bold text-slate-900">{endRecord}</span> of{" "}
        <span className="font-bold text-slate-900">{totalRecords}</span> results
      </p>
      <div className="flex items-center gap-2">
        {getPageUrl ? (
          isPrevDisabled ? (
            <button type="button" disabled className={btnClasses}>
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
          ) : (
            <Link href={getPageUrl(prevPage)} className={btnClasses}>
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Link>
          )
        ) : (
          <button
            type="button"
            disabled={isPrevDisabled}
            onClick={onPageChange ? () => onPageChange(prevPage) : undefined}
            className={btnClasses}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
        )}

        <span className="px-3.5 py-1.5 bg-[#1E1E1E] text-white text-xs font-black rounded-full shadow-2xs">
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>

        {getPageUrl ? (
          isNextDisabled ? (
            <button type="button" disabled className={btnClasses}>
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link href={getPageUrl(nextPage)} className={btnClasses}>
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )
        ) : (
          <button
            type="button"
            disabled={isNextDisabled}
            onClick={onPageChange ? () => onPageChange(nextPage) : undefined}
            className={btnClasses}
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
