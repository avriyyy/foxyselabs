import { PenTool, Briefcase, Building2 } from "lucide-react";

const personas = [
  {
    icon: PenTool,
    title: "Blogger & Kreator",
    role: "Personal & Portofolio",
    desc: "Ingin berbagi cerita atau memamerkan karya dengan website cepat tanpa perlu pusing soal teknis server.",
  },
  {
    icon: Briefcase,
    title: "Freelancer & Agency",
    role: "Pengembang Website",
    desc: "Mencari hosting andal yang mudah dikelola untuk banyak klien dengan performa yang stabil setiap saat.",
  },
  {
    icon: Building2,
    title: "UMKM",
    role: "Usaha Kecil Menengah",
    desc: "Mulai mendigitalkan bisnis dengan biaya operasional minim tapi butuh server yang selalu bisa diandalkan.",
  },
];

export default function UntukSiapa() {
  return (
    <section id="untuk-siapa" className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <h2
          data-section-header
          className="text-3xl md:text-5xl text-center text-black mb-16"
        >
          Untuk <span className="text-brand">Siapa</span>?
        </h2>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {personas.map((p) => (
            <div
              key={p.title}
              className="glass-card glass rounded-2xl p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <p.icon size={28} />
              </div>
              <h3 className="text-xl text-black mb-1">{p.title}</h3>
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-brand/10 text-brand-deep font-medium mb-3">
                {p.role}
              </span>
              <p className="text-black/60 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
