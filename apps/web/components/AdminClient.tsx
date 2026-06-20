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

type Workspace = {
  path: string;
  name: string;
  created_at: string;
  user_count: number;
};

type Access = {
  user_id: string;
  email: string;
  name: string;
  can_read: boolean;
  can_write: boolean;
  granted_by?: string;
  created_at: string;
};

export function AdminClient({ me }: { me: User }) {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "workspaces">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [workspaces_, setWorkspaces_] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const [showWsForm, setShowWsForm] = useState(false);
  const [wsPath, setWsPath] = useState("/data/workspaces/");
  const [wsAccessFor, setWsAccessFor] = useState<string | null>(null);
  const [wsAccessList, setWsAccessList] = useState<Access[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [u, w] = await Promise.all([
        fetch(`${PUBLIC_GATEWAY_URL}/api/admin/users`).then((r) => r.json()),
        fetch(`${PUBLIC_GATEWAY_URL}/api/workspaces`).then((r) => r.json()),
      ]);
      setUsers(u.data || []);
      setWorkspaces(w.data || []);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAccess(path: string) {
    try {
      const r = await fetch(
        `${PUBLIC_GATEWAY_URL}/api/workspaces/access?path=${encodeURIComponent(path)}`
      );
      const data = await r.json();
      setWsAccessList(data.data || []);
    } catch {
      setWsAccessList([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (wsAccessFor) loadAccess(wsAccessFor);
  }, [wsAccessFor]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const wsList = workspaces_.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    const res = await fetch(`${PUBLIC_GATEWAY_URL}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, is_admin: isAdmin, workspaces: wsList }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Failed to create user");
      return;
    }
    setName(""); setEmail(""); setPassword(""); setIsAdmin(false); setWorkspaces_("");
    setShowForm(false);
    load();
  }

  async function createWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch(`${PUBLIC_GATEWAY_URL}/api/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: wsPath, name: wsPath.split("/").filter(Boolean).pop() || wsPath }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Failed to create workspace");
      return;
    }
    setShowWsForm(false);
    load();
  }

  async function grantAccess(workspacePath: string, userId: string) {
    await fetch(
      `${PUBLIC_GATEWAY_URL}/api/workspaces/grant?path=${encodeURIComponent(workspacePath)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, can_read: true, can_write: true }),
      }
    );
    loadAccess(workspacePath);
    load();
  }

  async function revokeAccess(workspacePath: string, userId: string) {
    await fetch(
      `${PUBLIC_GATEWAY_URL}/api/workspaces/access?path=${encodeURIComponent(
        workspacePath
      )}&userId=${encodeURIComponent(userId)}`,
      { method: "DELETE" }
    );
    loadAccess(workspacePath);
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
    <main className="min-h-screen pt-20 pb-24 px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-label-mono text-[0.6rem] text-pink-neon uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-display-md font-display-md text-on-surface">Workspace & users</h1>
        </div>
        <button onClick={() => router.push("/chat")} className="btn-ghost text-[0.7rem] font-label-mono uppercase tracking-widest">
          Back to chat
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 mb-5">
        <TabBtn active={tab === "users"} onClick={() => setTab("users")}>
          Users ({users.length})
        </TabBtn>
        <TabBtn active={tab === "workspaces"} onClick={() => setTab("workspaces")}>
          Workspaces ({workspaces.length})
        </TabBtn>
      </div>

      {err && (
        <p className="mb-4 text-error text-[0.75rem] px-3 py-2 bg-error-container/20 border border-error/30">
          {err}
        </p>
      )}

      {tab === "users" ? (
        <UsersTab
          users={users}
          loading={loading}
          showForm={showForm}
          setShowForm={setShowForm}
          name={name} setName={setName}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          isAdmin={isAdmin} setIsAdmin={setIsAdmin}
          workspaces_={workspaces_} setWorkspaces_={setWorkspaces_}
          onCreate={createUser}
        />
      ) : (
        <WorkspacesTab
          workspaces={workspaces}
          users={users}
          loading={loading}
          showForm={showWsForm}
          setShowForm={setShowWsForm}
          wsPath={wsPath} setWsPath={setWsPath}
          wsAccessFor={wsAccessFor}
          setWsAccessFor={setWsAccessFor}
          wsAccessList={wsAccessList}
          onCreate={createWorkspace}
          onGrant={grantAccess}
          onRevoke={revokeAccess}
        />
      )}
    </main>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-[0.7rem] font-label-mono uppercase tracking-widest transition-colors border-b-2 ${
        active ? "border-pink-neon text-pink-neon" : "border-transparent text-text-subtle hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}

function UsersTab(props: {
  users: User[];
  loading: boolean;
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  isAdmin: boolean; setIsAdmin: (v: boolean) => void;
  workspaces_: string; setWorkspaces_: (v: string) => void;
  onCreate: (e: React.FormEvent) => void;
}) {
  return (
    <div className="stitch-node-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-text-subtle">
          {props.users.length} user{props.users.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => props.setShowForm(!props.showForm)}
          className="btn-primary-filled px-3 py-1.5 text-[0.6rem] font-label-mono uppercase tracking-widest"
        >
          {props.showForm ? "Cancel" : "Add user"}
        </button>
      </div>

      {props.showForm && (
        <form onSubmit={props.onCreate} className="space-y-3 border-t border-white/5 pt-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={props.name} onChange={(e) => props.setName(e.target.value)} placeholder="Name" required className="field-input text-[0.85rem]" />
            <input value={props.email} onChange={(e) => props.setEmail(e.target.value)} type="email" placeholder="Email" required className="field-input text-[0.85rem]" />
          </div>
          <input value={props.password} onChange={(e) => props.setPassword(e.target.value)} type="password" placeholder="Password (min 8)" required minLength={8} className="field-input text-[0.85rem] font-mono" />
          <textarea
            value={props.workspaces_}
            onChange={(e) => props.setWorkspaces_(e.target.value)}
            placeholder="Workspace paths to grant (one per line, e.g. /data/workspaces/project-a)"
            className="field-input text-[0.85rem] font-mono h-20"
          />
          <label className="flex items-center gap-2 text-[0.8rem] text-on-surface-variant">
            <input type="checkbox" checked={props.isAdmin} onChange={(e) => props.setIsAdmin(e.target.checked)} />
            Grant admin role
          </label>
          <button type="submit" className="btn-primary-filled w-full py-2.5 text-[0.65rem] font-label-mono uppercase tracking-widest">
            Create user
          </button>
        </form>
      )}

      {props.loading ? (
        <p className="text-[0.8rem] text-text-subtle">Loading users...</p>
      ) : (
        <ul className="space-y-2">
          {props.users.map((u) => (
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
  );
}

function WorkspacesTab(props: {
  workspaces: Workspace[];
  users: User[];
  loading: boolean;
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  wsPath: string; setWsPath: (v: string) => void;
  wsAccessFor: string | null;
  setWsAccessFor: (v: string | null) => void;
  wsAccessList: Access[];
  onCreate: (e: React.FormEvent) => void;
  onGrant: (wsPath: string, userId: string) => void;
  onRevoke: (wsPath: string, userId: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="stitch-node-glass p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-text-subtle">
            {props.workspaces.length} workspace{props.workspaces.length === 1 ? "" : "s"}
          </p>
          <button
            onClick={() => props.setShowForm(!props.showForm)}
            className="btn-primary-filled px-3 py-1.5 text-[0.6rem] font-label-mono uppercase tracking-widest"
          >
            {props.showForm ? "Cancel" : "Add workspace"}
          </button>
        </div>

        {props.showForm && (
          <form onSubmit={props.onCreate} className="space-y-3 border-t border-white/5 pt-4 mb-4">
            <input
              value={props.wsPath}
              onChange={(e) => props.setWsPath(e.target.value)}
              placeholder="/data/workspaces/project-name"
              required
              className="field-input text-[0.85rem] font-mono"
            />
            <p className="text-[0.65rem] text-text-subtle font-label-mono">
              Absolute path on the agent container. The agent will bind-mount this directory into the per-thread sandbox.
            </p>
            <button type="submit" className="btn-primary-filled w-full py-2.5 text-[0.65rem] font-label-mono uppercase tracking-widest">
              Create workspace
            </button>
          </form>
        )}

        {props.loading ? (
          <p className="text-[0.8rem] text-text-subtle">Loading...</p>
        ) : props.workspaces.length === 0 ? (
          <p className="text-[0.8rem] text-text-subtle">
            No workspaces yet. Create one above, or start a new chat and the default workspace will be auto-created.
          </p>
        ) : (
          <ul className="space-y-2">
            {props.workspaces.map((w) => (
              <li
                key={w.path}
                className="px-3 py-2.5 bg-surface-container-low border border-white/5 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[0.85rem] text-on-surface font-mono truncate">{w.path}</p>
                  <p className="text-[0.7rem] text-text-subtle">
                    {w.user_count} user{w.user_count === 1 ? "" : "s"} · created {new Date(w.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => props.setWsAccessFor(props.wsAccessFor === w.path ? null : w.path)}
                  className="btn-ghost px-2.5 py-1.5 text-[0.6rem] font-label-mono uppercase tracking-widest"
                >
                  {props.wsAccessFor === w.path ? "Close" : "Access"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {props.wsAccessFor && (
        <AccessPanel
          workspace={props.workspaces.find((w) => w.path === props.wsAccessFor)!}
          users={props.users}
          access={props.wsAccessList}
          onGrant={(uid) => props.onGrant(props.wsAccessFor!, uid)}
          onRevoke={(uid) => props.onRevoke(props.wsAccessFor!, uid)}
          onClose={() => props.setWsAccessFor(null)}
        />
      )}
    </div>
  );
}

function AccessPanel({
  workspace,
  users,
  access,
  onGrant,
  onRevoke,
  onClose,
}: {
  workspace: Workspace;
  users: User[];
  access: Access[];
  onGrant: (userId: string) => void;
  onRevoke: (userId: string) => void;
  onClose: () => void;
}) {
  const grantedUserIds = new Set(access.map((a) => a.user_id));
  const eligible = users.filter((u) => !grantedUserIds.has(u.id));
  return (
    <div className="stitch-node-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-text-subtle">
            Access for
          </p>
          <p className="text-[0.85rem] text-on-surface font-mono">{workspace.path}</p>
        </div>
        <button onClick={onClose} className="btn-ghost text-[0.7rem] font-label-mono uppercase tracking-widest">
          Close
        </button>
      </div>

      <p className="font-label-mono text-[0.55rem] uppercase tracking-widest text-text-subtle mb-2">
        Current access ({access.length})
      </p>
      {access.length === 0 ? (
        <p className="text-[0.75rem] text-text-subtle">No one has access yet.</p>
      ) : (
        <ul className="space-y-1.5 mb-4">
          {access.map((a) => (
            <li key={a.user_id} className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-container-low border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-[0.8rem] text-on-surface truncate">{a.name}</p>
                <p className="text-[0.65rem] text-text-subtle truncate font-mono">{a.email}</p>
              </div>
              <span className="text-[0.55rem] font-label-mono uppercase tracking-widest text-text-subtle">
                {a.can_read ? "R" : ""}{a.can_write ? "W" : ""}
              </span>
              <button
                onClick={() => onRevoke(a.user_id)}
                className="text-error text-[0.65rem] font-label-mono uppercase tracking-widest hover:underline"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}

      {eligible.length > 0 && (
        <>
          <p className="font-label-mono text-[0.55rem] uppercase tracking-widest text-text-subtle mb-2">
            Grant access
          </p>
          <ul className="space-y-1.5">
            {eligible.map((u) => (
              <li key={u.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-container-low border border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-[0.8rem] text-on-surface truncate">{u.name}</p>
                  <p className="text-[0.65rem] text-text-subtle truncate font-mono">{u.email}</p>
                </div>
                <button
                  onClick={() => onGrant(u.id)}
                  className="text-pink-neon text-[0.65rem] font-label-mono uppercase tracking-widest hover:underline"
                >
                  Grant
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
