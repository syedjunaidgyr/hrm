"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface StatusRow {
  id: string;
  entityType: string;
  code: string;
  description: string;
  result: string;
  clientId: string | null;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  allowedNext: string | null;
  client?: { id: string; name: string; code: string } | null;
}

interface ClientOpt {
  id: string;
  name: string;
}

const emptyForm = {
  entityType: "JD",
  code: "",
  description: "",
  result: "PENDING",
  clientId: "",
  sortOrder: "0",
  isActive: true,
  allowedNext: "",
};

export function StatusMastersClient({ clients }: { clients: ClientOpt[] }) {
  const [rows, setRows] = useState<StatusRow[]>([]);
  const [filter, setFilter] = useState<"ALL" | "JD" | "CANDIDATE">("ALL");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const qs = filter !== "ALL" ? `?entityType=${filter}` : "";
    const res = await fetch(`/api/admin/status-masters${qs}`);
    const data = await res.json();
    if (data.success) setRows(data.statuses);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [filter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, entityType: filter === "CANDIDATE" ? "CANDIDATE" : "JD" });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (s: StatusRow) => {
    setEditingId(s.id);
    let allowed = "";
    try {
      if (s.allowedNext) allowed = (JSON.parse(s.allowedNext) as string[]).join(", ");
    } catch {
      allowed = "";
    }
    setForm({
      entityType: s.entityType,
      code: s.code,
      description: s.description,
      result: s.result,
      clientId: s.clientId || "",
      sortOrder: String(s.sortOrder),
      isActive: s.isActive,
      allowedNext: allowed,
    });
    setError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.description.trim()) {
      setError("Code and description are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const allowedNext = form.allowedNext
      .split(",")
      .map((s) => s.trim().toUpperCase().replace(/\s+/g, "_"))
      .filter(Boolean);
    const payload = {
      entityType: form.entityType,
      code: form.code,
      description: form.description,
      result: form.result,
      clientId: form.clientId || null,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
      allowedNext: form.entityType === "CANDIDATE" ? allowedNext : null,
    };
    try {
      const url = editingId ? `/api/admin/status-masters/${editingId}` : "/api/admin/status-masters";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || "Failed to save.");
        return;
      }
      setShowForm(false);
      reload();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: StatusRow) => {
    if (s.isSystem) {
      alert("System statuses cannot be deleted. Deactivate them instead.");
      return;
    }
    if (!confirm(`Delete status "${s.description}" (${s.code})?`)) return;
    await fetch(`/api/admin/status-masters/${s.id}`, { method: "DELETE" });
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Status Masters</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Maintain JD and Candidate statuses used across the application.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["ALL", "JD", "CANDIDATE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                filter === f
                  ? "bg-[#1E1E1E] text-white border-[#1E1E1E]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f === "ALL" ? "All" : f === "JD" ? "Job Description" : "Candidate"}
            </button>
          ))}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#1E1E1E] text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Status
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200/80 p-8 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingId ? "Edit Status" : "New Status"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Entity *</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  value={form.entityType}
                  disabled={!!editingId}
                  onChange={(e) => setForm((p) => ({ ...p, entityType: e.target.value }))}
                >
                  <option value="JD">Job Description</option>
                  <option value="CANDIDATE">Candidate</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Result *</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  value={form.result}
                  onChange={(e) => setForm((p) => ({ ...p, result: e.target.value }))}
                >
                  <option value="PENDING">Pending</option>
                  <option value="WIP">WIP</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Code *</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  value={form.code}
                  disabled={!!editingId}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="e.g. ON_HOLD"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Description *</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. On Hold"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Client (optional)</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  value={form.clientId}
                  onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}
                >
                  <option value="">Global (all clients)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {form.entityType === "CANDIDATE" && (
                <div className="col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Allowed Next Codes (comma-separated)
                  </label>
                  <input
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                    value={form.allowedNext}
                    onChange={(e) => setForm((p) => ({ ...p, allowedNext: e.target.value }))}
                    placeholder="VIEWED, REJECTED_L1, ON_HOLD"
                  />
                </div>
              )}
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-700">
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#1E1E1E] text-white disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Entity</th>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">Result</th>
                <th className="px-4 py-3.5">Client</th>
                <th className="px-4 py-3.5">Order</th>
                <th className="px-4 py-3.5">Flags</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    <ListChecks className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No statuses found.
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3.5">
                      <Badge variant={s.entityType === "JD" ? "blue" : "purple"}>{s.entityType}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-bold">{s.code}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{s.description}</td>
                    <td className="px-4 py-3.5">
                      <Badge status={s.result}>{s.result}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{s.client?.name || "Global"}</td>
                    <td className="px-4 py-3.5">{s.sortOrder}</td>
                    <td className="px-4 py-3.5 space-x-1">
                      {s.isSystem && <Badge variant="gray">System</Badge>}
                      {!s.isActive && <Badge variant="red">Inactive</Badge>}
                      {s.isActive && !s.isSystem && <Badge variant="green">Active</Badge>}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="inline-flex p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {!s.isSystem && (
                        <button
                          onClick={() => handleDelete(s)}
                          className="inline-flex p-2 rounded-lg text-rose-500 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
