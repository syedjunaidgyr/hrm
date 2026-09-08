import React from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyText?: string;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyText = "No records found.",
  isLoading = false,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-left text-sm text-slate-700 border-collapse">
        <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-3.5 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#0C54D9] border-t-transparent animate-spin" />
                  Loading data...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500 font-medium">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-slate-50/70 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-4 py-3.5 text-slate-800 ${col.className || ""}`}>
                    {col.cell ? col.cell(row) : col.accessorKey ? (row[col.accessorKey] as any) : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
