"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface JobTitle {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

const emptyForm = { name: "", status: "ACTIVE" };

export function JobTitlesClient() {
  const [titles, setTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/job-titles");
    const data = await res.json();
    if (data.success) setTitles(data.jobTitles);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (t: JobTitle) => {
    setEditingId(t.id);
    setForm({ name: t.name, status: t.status });
    setError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = editingId ? `/api/admin/job-titles/${editingId}` : "/api/admin/job-titles";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete job title "${name}"?`)) return;
    await fetch(`/api/admin/job-titles/${id}`, { method: "DELETE" });
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Titles</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Master list of job titles used as dropdowns and filters.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#1E1E1E] text-white hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Job Title
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200/80 p-8 w-full max-w-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingId ? "Edit Job Title" : "New Job Title"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</p>
            )}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Name *</label>
              <input
                autoFocus
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Status</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
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
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Name</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : titles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No job titles yet.
                </td>
              </tr>
            ) : (
              titles.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{t.name}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={t.status === "ACTIVE" ? "green" : "gray"}>{t.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <button
                      onClick={() => openEdit(t)}
                      className="inline-flex p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="inline-flex p-2 rounded-lg text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
