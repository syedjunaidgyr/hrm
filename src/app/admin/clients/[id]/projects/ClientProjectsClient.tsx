"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, X, Check, FolderOpen, Mail, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Project {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  status: string;
  createdAt: string;
}

interface FormState {
  name: string;
  contactName: string;
  contactEmail: string;
  status: string;
}

const emptyForm: FormState = { name: "", contactName: "", contactEmail: "", status: "ACTIVE" };

export function ClientProjectsClient({ clientId }: { clientId: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/clients/${clientId}/projects`);
    const data = await res.json();
    if (data.success) setProjects(data.projects);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [clientId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({ name: p.name, contactName: p.contactName ?? "", contactEmail: p.contactEmail ?? "", status: p.status });
    setShowForm(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Project name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const url = editingId
        ? `/api/admin/clients/${clientId}/projects/${editingId}`
        : `/api/admin/clients/${clientId}/projects`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) { setError(data.error?.message || "Failed to save."); return; }
      setShowForm(false);
      fetchProjects();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await fetch(`/api/admin/clients/${clientId}/projects/${projectId}`, { method: "DELETE" });
    fetchProjects();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/clients"
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage projects for this client.</p>
        </div>
        <button
          onClick={openCreate}
          className="ml-auto flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#1E1E1E] text-white hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200/80 p-8 w-full max-w-md space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingId ? "Edit Project" : "New Project"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Project Name *</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Site A Expansion 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Contact Name</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="e.g. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="jane@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Status</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1E1E1E] text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-60 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects list */}
      <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xs p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-medium text-sm">No projects yet for this client.</p>
            <button onClick={openCreate} className="text-xs font-bold text-blue-600 hover:underline">
              Create the first project →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {projects.map((p) => (
              <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">{p.name}</h4>
                    <Badge status={p.status} size="sm">{p.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {p.contactName && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {p.contactName}
                      </span>
                    )}
                    {p.contactEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {p.contactEmail}
                      </span>
                    )}
                    <span>Added {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
