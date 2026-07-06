"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import Logo from "./Logo";

const links = [
  { label: "Paket", href: "#produk" },
  { label: "Keunggulan", href: "#kenapa" },
  { label: "Cara Kerja", href: "#cara" },
  { label: "Untuk Siapa", href: "#untuk-siapa" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setUser(data.user);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menu]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenu(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const isLanding = pathname === "/";

  const initials = (user?.name || user?.email || "?")
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="mx-auto max-w-6xl rounded-2xl glass-nav px-5 py-3 flex items-center justify-between">
        <Link href="/" aria-label="FoxyseLabs home">
          <Logo />
        </Link>

        {isLanding && (
          <ul className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-black/70 hover:text-brand transition-colors text-lg"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-20" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-lg text-black/80 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenu((v) => !v)}
                  className="h-9 w-9 rounded-full btn-glass flex items-center justify-center text-sm font-medium"
                  aria-label="User menu"
                >
                  {initials}
                </button>
                {menu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl glass-nav p-1.5 z-20">
                    <div className="px-3 py-2 border-b border-black/5 mb-1">
                      <p className="text-sm text-black font-medium truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-black/45 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-600/80 hover:bg-red-500/10 flex items-center gap-2 text-sm"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-lg text-black/80 hover:text-black transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-glass px-5 py-2 rounded-xl text-lg font-medium"
              >
                Start Free
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg text-black"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden mx-auto max-w-6xl mt-2 rounded-2xl glass-nav p-4 flex flex-col gap-3">
          {isLanding &&
            links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-black/80 hover:text-brand text-lg py-1"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl text-lg border border-black/10 flex items-center gap-2 justify-center"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <div className="px-4 py-2 text-sm text-black/55">
                Signed in as <span className="text-black">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-600 px-4 py-2 rounded-xl text-lg border border-red-200 flex items-center gap-2 justify-center"
              >
                <LogOut size={16} /> Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-3 mt-2">
              <Link href="/login" className="flex-1 text-center px-4 py-2 rounded-xl text-lg border border-black/10">
                Sign In
              </Link>
              <Link href="/signup" className="btn-glass flex-1 text-center px-4 py-2 rounded-xl text-lg font-medium">
                Start Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
