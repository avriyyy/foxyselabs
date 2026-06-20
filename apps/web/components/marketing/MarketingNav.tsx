import Link from "next/link";
import Logo from "../Logo";
import { IconLogOut, IconSettings } from "../Icons";
import type { User } from "@/lib/types";
import { api } from "@/lib/api";

export function MarketingNav({ user }: { user?: User | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo size={28} />
          <span className="font-display-md text-[1.05rem] tracking-tighter">
            <span className="text-on-surface">Foxyse</span>
            <span className="text-pink-neon">Labs</span>
            <span className="text-on-surface">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[0.78rem] font-label-mono uppercase tracking-widest text-on-surface-variant">
          <Link href="/#features" className="hover:text-pink-neon transition-colors">
            Features
          </Link>
          <Link href="/#how" className="hover:text-pink-neon transition-colors">
            How it works
          </Link>
          <Link href="/#pricing" className="hover:text-pink-neon transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                href="/chat"
                className="btn-primary-filled px-4 py-2 text-[0.65rem]"
              >
                Open Chat
              </Link>
              <Link
                href="/settings"
                className="btn-ghost p-2"
                aria-label="Settings"
              >
                <IconSettings size={18} />
              </Link>
              <form
                action={async () => {
                  "use server";
                  await api("/api/auth/logout", { method: "POST" });
                }}
              >
                <button
                  type="submit"
                  className="btn-ghost p-2"
                  aria-label="Log out"
                >
                  <IconLogOut size={18} />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-ghost px-3 py-2 text-[0.65rem] font-label-mono uppercase tracking-widest"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary-filled px-4 py-2 text-[0.65rem]"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
