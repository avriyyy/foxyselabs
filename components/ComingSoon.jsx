import { Hammer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-24 w-24 bg-brand/10 text-brand rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        <Hammer size={40} className="animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold text-black mb-3">{title || "Segera Hadir"}</h1>
      <p className="text-black/60 max-w-md mx-auto mb-8">
        {description || "Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia untuk Anda. Nantikan pembaruannya!"}
      </p>
      <Link href="/dashboard" className="btn-brand px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2">
        <ArrowLeft size={18} /> Kembali ke Dashboard
      </Link>
    </div>
  );
}
