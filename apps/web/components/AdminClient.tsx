"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PUBLIC_GATEWAY_URL } from "@/lib/api";

type User = {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
};

export function AdminClient({ me }: { me: User }) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [workspaces, setWorkspaces] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${PUBLIC_GATEWAY_URL}/api/admin/users`, { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const wsList = workspaces.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    const res = await fetch(`${PUBLIC_GATEWAY_URL}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, email, password,
        is_admin: isAdmin,
        workspaces: wsList,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Failed to create user");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setIsAdmin(false);
    setWorkspaces("");
    setShowForm(false);
    load();
  }

  if (!me.is_admin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-on-surface">
        <div className="text-center">
          <p className="text-on-surface-variant mb-3">Admin access required.</p>
          <button onClick={() => router.push("/chat")} className="btn-cyber-pink px-4 py-2 text-[0.65rem]">
            Back to chat
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-24 px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-label-mono text-[0.6rem] text-pink-neon uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-display-md font-display-md text-on-surface">Users & workspaces</h1>
        </div>
        <button onClick={() => router.push("/chat")} className="btn-ghost text-[0.7rem] font-label-mono uppercase tracking-widest">
          Back to chat
        </button>
      </div>

      <div className="stitch-node-glass p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-text-subtle">
            {users.length} user{users.length === 1 ? "" : "s"}
          </p>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="btn-primary-filled px-3 py-1.5 text-[0.6rem] font-label-mono uppercase tracking-widest"
          >
            {showForm ? "Cancel" : "Add user"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={createUser} className="space-y-3 border-t border-white/5 pt-4 mb-4">
            {err && <p className="text-error text-[0.7rem]">{err}</p>}
            <div className="grid grid-cols-2 gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="field-input text-[0.85rem]" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required className="field-input text-[0.85rem]" />
            </div>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password (min 8)" required minLength={8} className="field-input text-[0.85rem] font-mono" />
            <textarea
              value={workspaces}
              onChange={(e) => setWorkspaces(e.target.value)}
              placeholder="Workspace paths (one per line, e.g. /data/workspaces/project-a)"
              className="field-input text-[0.85rem] font-mono h-20"
            />
            <label className="flex items-center gap-2 text-[0.8rem] text-on-surface-variant">
              <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
              Grant admin role
            </label>
            <button type="submit" className="btn-primary-filled w-full py-2.5 text-[0.65rem] font-label-mono uppercase tracking-widest">
              Create user
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-[0.8rem] text-text-subtle">Loading users...</p>
        ) : (
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-3 py-2.5 bg-surface-container-low border border-white/5">
                <div className="w-8 h-8 rounded-DEFAULT bg-gradient-to-br from-pink-neon to-primary-container flex items-center justify-center font-label-mono text-[0.7rem] font-semibold text-on-primary">
                  {u.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.85rem] text-on-surface truncate">{u.name}</p>
                  <p className="text-[0.7rem] text-text-subtle truncate font-mono">{u.email}</p>
                </div>
                {u.is_admin && (
                  <span className="font-label-mono text-[0.55rem] uppercase tracking-widest text-pink-neon border border-pink-neon/40 px-2 py-0.5">
                    admin
                  </span>
                )}
                <span className="text-[0.6rem] font-mono text-text-muted">
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
