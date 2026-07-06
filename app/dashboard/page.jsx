import { Server, Zap, Globe, Plus } from "lucide-react";

const stats = [
  { label: "Layanan Aktif", value: "2", icon: Server, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Domain Terdaftar", value: "1", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Tagihan Belum Dibayar", value: "0", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-black">Selamat Datang di FoxyseLabs</h1>
          <p className="text-black/60 mt-1 text-sm">Kelola layanan hosting dan domain Anda dari satu tempat.</p>
        </div>
        <button className="btn-brand px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shrink-0 self-start md:self-auto">
          <Plus size={16} /> Pesan Layanan Baru
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
            <div className={`h-12 w-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}>
              <s.icon size={24} />
            </div>
            <p className="text-3xl font-semibold text-black mb-1">{s.value}</p>
            <p className="text-sm text-black/60">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-black mb-4">Layanan Aktif Anda</h2>
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-black/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Server size={24} />
            </div>
            <div>
              <h3 className="font-medium text-black text-lg">Paket Bisnis - MyStore.com</h3>
              <p className="text-sm text-black/50">20GB SSD • Aktif hingga 12 Agustus 2027</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-lg transition-colors shrink-0 w-full md:w-auto">
            Kelola Hosting
          </button>
        </div>
      </div>
    </div>
  );
}
