import Link from "next/link";
import { User, Briefcase, ArrowRight } from "lucide-react";

const templates = [
  {
    slug: "personal",
    icon: User,
    title: "Paket Personal",
    desc: "Cocok untuk blog pribadi atau portofolio dengan traffic menengah. Kapasitas SSD 5GB dan Bandwidth Unlimited.",
    tags: ["5GB SSD", "Unlimited Bandwidth", "1 Domain"],
    coming: false,
  },
  {
    slug: "bisnis",
    icon: Briefcase,
    title: "Paket Bisnis",
    desc: "Performa maksimal untuk toko online atau company profile. Kapasitas SSD 20GB dan Gratis Domain .com.",
    tags: ["20GB SSD", "Gratis Domain", "Prioritas Support"],
    coming: false,
  },
];

export default function PilihanTemplate() {
  return (
    <section id="produk" className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <h2
          data-section-header
          className="text-3xl md:text-5xl text-center text-black mb-4"
        >
          Pilihan <span className="text-brand">Paket</span>
        </h2>
        <p className="text-center text-black/60 text-lg mb-16 max-w-xl mx-auto">
          Pilih paket hosting yang sesuai dengan kebutuhan bisnismu
        </p>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {templates.map((t) => (
            <Link
              key={t.slug}
              href="/signup"
              className="glass-card glass rounded-2xl p-7 hover:shadow-lg transition-shadow block group"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <t.icon size={24} />
                </div>
                {t.coming && (
                  <span className="text-xs px-3 py-1 rounded-full bg-brand/10 text-brand-deep font-medium">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="text-2xl text-black mb-2">{t.title}</h3>
              <p className="text-black/60 leading-relaxed mb-4">{t.desc}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {t.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-md bg-black/5 text-black/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-brand font-medium group-hover:gap-2 transition-all">
                Lihat Detail <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
