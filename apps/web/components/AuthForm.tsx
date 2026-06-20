"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { IconLoader } from "@/components/Icons";

type Tab = "login" | "register";

export function AuthForm({ initialTab = "login" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: form,
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
      return;
    }
    const data = await res.json();
    if (data.redirect) window.location.href = data.redirect;
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: form,
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Registration failed");
      return;
    }
    const data = await res.json();
    if (data.redirect) window.location.href = data.redirect;
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
          <div className="flex border-b border-white/5 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={`flex-1 pb-3 text-[0.65rem] font-label-mono uppercase tracking-widest transition-all border-b-2 ${
                tab === "login"
                  ? "border-pink-neon text-pink-neon"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`flex-1 pb-3 text-[0.65rem] font-label-mono uppercase tracking-widest transition-all border-b-2 ${
                tab === "register"
                  ? "border-pink-neon text-pink-neon"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <p className="text-error text-[0.7rem] font-label-mono tracking-wider mb-4 px-2 py-1.5 bg-error-container/20 border border-error/30">
              {error}
            </p>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
              <Field label="Password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
              <button type="submit" disabled={loading} className="btn-primary-filled w-full py-3 text-[0.65rem] mt-2 font-label-mono uppercase tracking-widest">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <IconLoader size={14} />
                    Signing in
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <Field label="Name" name="name" type="text" autoComplete="name" placeholder="John Doe" required />
              <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
              <Field label="Password" name="password" type="password" autoComplete="new-password" placeholder="Min 8 characters" minLength={8} required />
              <button type="submit" disabled={loading} className="btn-primary-filled w-full py-3 text-[0.65rem] mt-2 font-label-mono uppercase tracking-widest">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <IconLoader size={14} />
                    Creating account
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </form>
          )}

          <p className="text-text-subtle text-[0.65rem] font-body-sm mt-6 text-center">
            <Link href="/" className="hover:text-pink-neon transition-colors">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  required,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-mono">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="field-input text-[0.85rem]"
      />
    </label>
  );
}
