"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Globe, Rocket, LayoutTemplate, Bot, CreditCard, LifeBuoy, Settings, LogOut, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const navItems = [
  { label: "Beranda", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Deployment", icon: Rocket, href: "/dashboard/deployment" },
  { label: "Domain", icon: Globe, href: "/dashboard/domain" },
  { label: "Templates", icon: LayoutTemplate, href: "/dashboard/templates" },
  { label: "Agents", icon: Bot, href: "/dashboard/agents" },
  { label: "Tagihan", icon: CreditCard, href: "/dashboard/tagihan" },
  { label: "Tiket Bantuan", icon: LifeBuoy, href: "/dashboard/tiket" },
  { label: "Pengaturan", icon: Settings, href: "/dashboard/pengaturan" },
];

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.replace("/login?next=/dashboard");
        } else {
          setUser(data.user);
          setLoading(false);
        }
      })
      .catch(() => {
        router.replace("/login?next=/dashboard");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <p className="text-black/50">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-black/5 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center px-6 border-b border-black/5 shrink-0">
          <Link href="/" className="inline-flex items-center">
            <Logo className="scale-75 origin-left" />
          </Link>
          <button 
            className="ml-auto md:hidden text-black/50 hover:text-black"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive 
                    ? "bg-brand/10 text-brand font-medium" 
                    : "text-black/60 hover:bg-black/5 hover:text-black"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-black/5 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-medium shrink-0">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-black truncate">{user?.name || "Client"}</p>
              <p className="text-xs text-black/50 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600/80 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex items-center px-6 bg-white border-b border-black/5 shrink-0 md:hidden">
          <button 
            className="text-black/50 hover:text-black"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-medium text-black">Dashboard</span>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
