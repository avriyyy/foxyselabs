"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { PUBLIC_GATEWAY_URL } from "@/lib/api";
import { IconLoader } from "@/components/Icons";

export function SetupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${PUBLIC_GATEWAY_URL}/api/admin/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || data.message || "Setup failed");
        setLoading(false);
        return
      }
      router.push("/chat");
    } catch (err) {
      setError("Could not reach server");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2.5 mb-7">
        <Logo size={28} />
        <span className="font-display-md text-[1.05rem] tracking-tighter">
          <span className="text-on-surface">Foxyse</span>
          <span className="text-pink-neon">Labs</span>
          <span className="text-on-surface">.</span>
        </span>
      </div>

      <div className="stitch-node-glass p-px">
        <div className="bg-surface-container-lowest p-6 md:p-8">
          <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon mb-2">
            First-time setup
          </p>
          <h1 className="text-display-md font-display-md text-on-surface mb-2">
            Create the master admin
          </h1>
          <p className="text-[0.8rem] text-on-surface-variant mb-6 leading-relaxed">
            This account owns the workspace and can add other users.
            Self-hosted, single instance — no email verification.
          </p>

          {error && (
            <p className="text-error text-[0.7rem] font-label-mono tracking-wider mb-4 px-2 py-1.5 bg-error-container/20 border border-error/30">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Name" value={name} onChange={setName} placeholder="Your name" />
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field
              label="Password (min 8 chars)"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Choose a strong password"
            />
            <button
              type="submit"
              disabled={loading || !name || !email || password.length < 8}
              className="btn-primary-filled w-full py-3 text-[0.65rem] mt-2 font-label-mono uppercase tracking-widest"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <IconLoader size={14} /> Creating admin
                </span>
              ) : (
                "Create admin & open chat"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-mono">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="field-input text-[0.85rem]"
      />
    </label>
  );
}
