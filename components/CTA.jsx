import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="glass-cta mx-auto max-w-3xl rounded-3xl glass px-8 py-14 text-center">
        <Sparkles size={36} className="mx-auto text-brand mb-4" />
        <h2 className="text-3xl md:text-5xl text-black mb-4">
          Siap Mengonlinekan{" "}
          <span className="text-brand">Website-mu</span>?
        </h2>
        <p className="text-black/60 text-lg mb-8 max-w-lg mx-auto">
          Pilih paket hosting sesuai kebutuhanmu dan dapatkan domain gratis untuk memulai.
        </p>
        <Link
          href="#produk"
          className="btn-brand inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-lg"
        >
          Lihat Paket <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
