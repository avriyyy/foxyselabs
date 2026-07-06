import Link from "next/link";
import { Sparkles, ArrowRight, Eye } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl animate-float-slow" />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-brand-soft blur-3xl animate-float" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-100 blur-3xl animate-float-slow" />
      </div>

      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm text-brand-deep mb-6">
          <Sparkles size={16} />
          Web Hosting Murah + Performa Maksimal
        </div>

        <h1 className="text-4xl md:text-6xl leading-tight text-black">
          Layanan hosting website andal dengan harga yang{" "}
          <span className="text-brand">paling masuk akal</span>.
        </h1>

        <p className="mt-6 text-lg md:text-xl text-black/70 max-w-2xl mx-auto">
          Pilih paket personal atau bisnis, dapatkan domain gratis,
          dan kelola website-mu dengan mudah melalui cPanel.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="#produk" className="btn-brand px-7 py-3 rounded-xl text-lg flex items-center gap-2">
            Lihat Paket <ArrowRight size={18} />
          </Link>
          <a href="#cara" className="btn-glass px-7 py-3 rounded-xl text-lg flex items-center gap-2 font-medium">
            <Eye size={18} /> Cara Kerja
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-black/50">
          <span>✓ Gratis Domain</span>
          <span>✓ Uptime 99.9%</span>
          <span>✓ Support 24/7</span>
        </div>
      </div>
    </section>
  );
}
