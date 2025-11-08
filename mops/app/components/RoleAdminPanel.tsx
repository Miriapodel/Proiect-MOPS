"use client";

import { useEffect, useState } from "react";

type Role = "CITIZEN" | "OPERATOR" | "ADMIN";
type UserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
};

const ROLES: Role[] = ["CITIZEN", "OPERATOR", "ADMIN"];

export default function RoleAdminPanel() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRows(data.items ?? []);
    } catch (e: any) {
      setErr(e?.message || "Eroare la încărcare");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateRole(id: string, role: Role) {
    setSavingId(id);
    setOk(null);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error(await res.text());
      setRows(prev => prev.map(r => (r.id === id ? { ...r, role } : r)));
      setOk("Rol actualizat");
      setTimeout(() => setOk(null), 2000);
    } catch (e: any) {
      setErr(e?.message || "Eroare la salvare");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="h-[300px] w-full rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p className="text-gray-600">Se încarcă utilizatorii…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ok && (
        <div className="p-3 rounded-xl bg-green-50 border-2 border-green-200 text-green-900 text-sm">
          ✅ {ok}
        </div>
      )}
      {err && (
        <div className="p-3 rounded-xl bg-red-50 border-2 border-red-300 text-red-800 text-sm">
          ⚠️ {err}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border-2 border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-700">
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Nume</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3 text-gray-900">{u.email}</td>
                <td className="px-4 py-3 text-gray-800">
                  {[u.firstName, u.lastName].filter(Boolean).join(" ") || "-"}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value as Role)}
                    disabled={savingId === u.id}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {savingId === u.id && (
                    <span className="text-gray-500 text-xs">Salvez…</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={4}>
                  Nicio înregistrare.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
