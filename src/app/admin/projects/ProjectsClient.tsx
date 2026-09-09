"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderOpen, Plus, Search, Mail, User, ExternalLink,
  Building2, X, Check, Pencil, Trash2, Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ProjectWithClient {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  status: string;
  createdAt: Date | string;
  client: { id: string; name: string; code: string };
}

interface Client {
  id: string;
  name: string;
  code: string;
}

interface FormState {
  clientId: string;
  name: string;
  contactName: string;
  contactEmail: string;
  status: string;
}

const emptyForm = (clients: Client[]): FormState => ({
  clientId: clients[0]?.id ?? "",
  name: "",
  contactName: "",
  contactEmail: "",
  status: "ACTIVE",
});

interface Props {
  initialProjects: ProjectWithClient[];
  clients: Client[];
}

export function ProjectsClient({ initialProjects, clients }: Props) {
  const [projects, setProjects] = useState<ProjectWithClient[]>(initialProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithClient | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(clients));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = projects.filter((p) => {
    const matchSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.contactName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditingProject(null);
    setForm(emptyForm(clients));
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (p: ProjectWithClient) => {
    setEditingProject(p);
    setForm({
      clientId: p.client.id,
      name: p.name,
      contactName: p.contactName ?? "",
      contactEmail: p.contactEmail ?? "",
      status: p.status,
    });
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Project name is required."); return; }
    if (!form.clientId) { setFormError("Please select a client."); return; }
    setSaving(true);
    setFormError(null);

    try {
      const url = editingProject
        ? `/api/admin/clients/${editingProject.client.id}/projects/${editingProject.id}`
        : `/api/admin/clients/${form.clientId}/projects`;
      const method = editingProject ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          contactName: form.contactName.trim() || null,
          contactEmail: form.contactEmail.trim() || null,
          status: form.status,
        }),
      });
      const data = await res.json();
      if (!data.success) { setFormError(data.error?.message || "Failed to save."); return; }

      // Refetch all projects to keep list fresh
      const listRes = await fetch("/api/admin/projects");
      const listData = await listRes.json();
      if (listData.success) setProjects(listData.projects);

      closeForm();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: ProjectWithClient) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setDeleting(p.id);
    try {
      await fetch(`/api/admin/clients/${p.client.id}/projects/${p.id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((x) => x.id !== p.id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            All projects across every client — {projects.length} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1E1E] text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by project or client name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-2xs"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {["ALL", "ACTIVE", "INACTIVE"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                statusFilter === s
                  ? "bg-[#1E1E1E] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xs p-16 flex flex-col items-center gap-3 text-center">
          <FolderOpen className="w-10 h-10 text-slate-300" />
          <p className="text-slate-500 font-medium text-sm">No projects found.</p>
          {clients.length > 0 ? (
            <button
              onClick={openCreate}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Create your first project →
            </button>
          ) : (
            <p className="text-xs text-slate-400">
              Add a{" "}
              <Link href="/admin/clients" className="text-blue-600 hover:underline font-bold">
                client
              </Link>{" "}
              first before creating projects.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-[28px] border border-slate-200/80 shadow-2xs p-5 space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Project name + status + actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight truncate">{p.name}</h3>
                  <Link
                    href={`/admin/clients/${p.client.id}/projects`}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{p.client.name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-400">{p.client.code}</span>
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge status={p.status} size="sm">{p.status}</Badge>
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
                    title="Edit project"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={deleting === p.id}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-400 hover:bg-rose-50 transition-all disabled:opacity-50"
                    title="Delete project"
                  >
                    {deleting === p.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Trash2 className="w-3 h-3" />
                    }
                  </button>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5">
                {p.contactName && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{p.contactName}</span>
                  </div>
                )}
                {p.contactEmail && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${p.contactEmail}`} className="hover:text-blue-600 hover:underline truncate">
                      {p.contactEmail}
                    </a>
                  </div>
                )}
                {!p.contactName && !p.contactEmail && (
                  <p className="text-xs text-slate-400 italic">No contact info</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Added {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <Link
                  href={`/admin/clients/${p.client.id}/projects`}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Manage <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200/80 p-8 w-full max-w-md space-y-5">
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingProject ? "Edit Project" : "New Project"}
              </h3>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">
                {formError}
              </p>
            )}

            <div className="space-y-4">
              {/* Client selector — locked when editing */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Client <span className="text-rose-500">*</span>
                </label>
                {editingProject ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-bold">{editingProject.client.name}</span>
                    <span className="text-xs text-slate-400 font-mono ml-auto">{editingProject.client.code}</span>
                  </div>
                ) : (
                  <select
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                  >
                    {clients.length === 0 && (
                      <option value="">No clients available</option>
                    )}
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Project name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Site A Expansion 2026"
                  autoFocus
                />
              </div>

              {/* Contact name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Contact Name</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="e.g. Jane Smith"
                />
              </div>

              {/* Contact email */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="jane@company.com"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Status</label>
                <div className="flex gap-2">
                  {["ACTIVE", "INACTIVE"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        form.status === s
                          ? "bg-[#1E1E1E] text-white border-[#1E1E1E]"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={closeForm}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1E1E1E] text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-60 transition-all"
              >
                {saving ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                ) : (
                  <><Check className="w-3.5 h-3.5" /> {editingProject ? "Save Changes" : "Create Project"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
