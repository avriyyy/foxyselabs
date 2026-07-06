"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) router.replace(next);
      })
      .catch(() => {});
  }, [router, next]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm text-black/60 mb-1.5">
          Name <span className="text-black/40">(optional)</span>
        </label>
        <div className="relative">
          <User
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
          />
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="w-full rounded-xl border border-black/10 bg-white/50 pl-11 pr-4 py-3 text-black placeholder:text-black/35 outline-none focus:border-brand/50 focus:bg-white/70 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-black/60 mb-1.5">
          Email
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl border border-black/10 bg-white/50 pl-11 pr-4 py-3 text-black placeholder:text-black/35 outline-none focus:border-brand/50 focus:bg-white/70 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-black/60 mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
          />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            className="w-full rounded-xl border border-black/10 bg-white/50 pl-11 pr-4 py-3 text-black placeholder:text-black/35 outline-none focus:border-brand/50 focus:bg-white/70 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-brand w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>

      <p className="text-sm text-center text-black/55 pt-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-deep font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-brand/15 blur-3xl animate-float-slow" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-brand-soft blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/3 h-80 w-80 rounded-full bg-brand/10 blur-3xl animate-float" />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8"
          aria-label="FoxyseLabs home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path
              fill="#db2777"
              d="M31.907 3.921A47.94 47.94 0 0 0 2.255 3.12A2.957 2.957 0 0 0 .094 6.787c.532 2.135 1.308 4.588 2.24 6.812c.016.052.041.027.041-.025c-.135-1.043.667-2.36 2.24-2.839a36.7 36.7 0 0 1 23.188.307a2.19 2.19 0 0 0 2.796-1.416c.932-3 1.308-5.037 1.401-5.547c.016-.095-.068-.131-.093-.157zm-23.043 6.6c-1.145.239-2.728.615-3.916 1.009c-2.375.819-2.265 3.709-1 4.631c.093-.536.667-1.265 1.307-1.511c2.371-.932 4.917-1.489 7.491-1.719c-1.308-.531-2.584-1.292-3.865-2.411zm18.907 5.786a28.2 28.2 0 0 0-21.932-.869c-1.131.427-1.839 1.803-1.131 3.109a51 51 0 0 0 4.199 6.401c-.224-.776.172-2.213 1.692-2.683c4.204-1.292 8.615-.744 11.547.443c.828.333 2 .131 2.657-.853a53 53 0 0 0 3.052-5.36c.041-.083 0-.145-.084-.188m-6.812 10.36a13.2 13.2 0 0 1-3.333-2.401c-.453-.453-1.12-1.104-1.823-1.88c-1.605 0-3.163.161-4.829.693c-1.547.484-1.692 2.271-1.015 3.203c1.145 1.427 1.948 2.197 3.229 3.521a3.655 3.655 0 0 0 5.093.025c1-1 1.615-1.667 2.745-2.948c.067-.068.041-.187-.068-.213z"
            />
          </svg>
          <span className="text-xl leading-none tracking-tight">
            <span className="text-black">Foxyse</span>
            <span className="text-brand">Labs</span>
            <span className="text-black">.</span>
          </span>
        </Link>

        <div className="glass rounded-3xl p-8">
          <h1 className="text-3xl text-black">Get started</h1>
          <p className="mt-1 text-black/55">
            Create an account to start managing your hosting.
          </p>

          <div className="mt-6">
            <Suspense
              fallback={
                <div className="text-center text-black/55 py-8">
                  Loading...
                </div>
              }
            >
              <SignupForm />
            </Suspense>
          </div>
        </div>

        <p className="text-center text-sm text-black/40 mt-6">
          <Link href="/" className="hover:text-black/70">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
