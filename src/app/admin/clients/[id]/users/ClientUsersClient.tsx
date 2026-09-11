"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, X, Check, Users, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Project {
  id: string;
  name: string;
  status: string;
}

interface ClientUser {
  id: string;
  name: string;
  email: string;
  status: string;
  accessAllProjects: boolean;
  projects: { id: string; name: string }[];
}

const emptyForm = {
  name: "",
  email: "",
  password: "",
  status: "ACTIVE",
  accessAllProjects: false,
  projectIds: [] as string[],
};

export function ClientUsersClient({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/clients/${clientId}/users`);
    const data = await res.json();
    if (data.success) {
      setUsers(data.users);
      setProjects(data.projects);
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [clientId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (u: ClientUser) => {
    setEditingId(u.id);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      status: u.status,
      accessAllProjects: u.accessAllProjects,
      projectIds: u.projects.map((p) => p.id),
    });
    setError(null);
    setShowForm(true);
  };

  const toggleProject = (pid: string) => {
    setForm((p) => ({
      ...p,
      projectIds: p.projectIds.includes(pid)
        ? p.projectIds.filter((id) => id !== pid)
        : [...p.projectIds, pid],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!editingId && !form.password.trim()) {
      setError("Password is required for new users.");
      return;
    }
    if (!form.accessAllProjects && form.projectIds.length === 0) {
      setError("Assign at least one project, or enable All Projects.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = editingId
        ? `/api/admin/clients/${clientId}/users/${editingId}`
        : `/api/admin/clients/${clientId}/users`;
      const method = editingId ? "PATCH" : "POST";
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        status: form.status,
        accessAllProjects: form.accessAllProjects,
        projectIds: form.accessAllProjects ? [] : form.projectIds,
      };
      if (form.password.trim()) payload.password = form.password;

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

  const handleDeactivate = async (u: ClientUser) => {
    if (!confirm(`Deactivate user "${u.name}"?`)) return;
    await fetch(`/api/admin/clients/${clientId}/users/${u.id}`, { method: "DELETE" });
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/clients"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Client Users</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {clientName} — users see only JDs/CVs for their tagged projects.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/clients/${clientId}/projects`}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            <FolderOpen className="w-4 h-4" /> Projects
          </Link>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#1E1E1E] text-white hover:bg-slate-800 shadow-sm"
          >
            <Plus className="w-4 h-4" /> New User
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200/80 p-8 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingId ? "Edit User" : "New User"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</p>
            )}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Name *</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Email (username) *</label>
                <input
                  type="email"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Password {editingId ? "(leave blank to keep)" : "*"}
                </label>
                <input
                  type="password"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
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
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.accessAllProjects}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, accessAllProjects: e.target.checked, projectIds: e.target.checked ? [] : p.projectIds }))
                  }
                />
                Access all projects for this client
              </label>
              {!form.accessAllProjects && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-2">Tagged Projects *</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-3">
                    {projects.length === 0 ? (
                      <p className="text-xs text-slate-500">No projects yet. Create projects first.</p>
                    ) : (
                      projects.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={form.projectIds.includes(p.id)}
                            onChange={() => toggleProject(p.id)}
                          />
                          {p.name}
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
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
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Name</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Projects</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No users yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{u.name}</td>
                  <td className="px-4 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">
                    {u.accessAllProjects ? (
                      <Badge variant="blue">All projects</Badge>
                    ) : u.projects.length ? (
                      u.projects.map((p) => p.name).join(", ")
                    ) : (
                      <span className="text-rose-500 font-bold">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge status={u.status}>{u.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <button
                      onClick={() => openEdit(u)}
                      className="inline-flex p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {u.status === "ACTIVE" && (
                      <button
                        onClick={() => handleDeactivate(u)}
                        className="text-[11px] font-bold text-rose-600 hover:underline px-2"
                      >
                        Deactivate
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
  );
}
