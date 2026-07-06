import { Server, Zap, Shield, Headphones } from "lucide-react";

const items = [
  {
    icon: Zap,
    title: "Performa Super Cepat",
    desc: "Didukung oleh LiteSpeed Web Server, menjamin loading website-mu secepat kilat.",
  },
  {
    icon: Server,
    title: "Uptime 99.9% Dijamin",
    desc: "Infrastruktur server andal dan termonitor 24/7 agar website kamu terus online.",
  },
  {
    icon: Shield,
    title: "Aman dari Serangan",
    desc: "Dilengkapi Imunify360 dan gratis SSL untuk melindungi data website-mu dari ancaman.",
  },
  {
    icon: Headphones,
    title: "Support Siap Bantu 24/7",
    desc: "Tim teknis kami selalu siap membalas tiket dan chat bantuan kapan pun kamu butuh.",
  },
];

export default function KenapaPilihKami() {
  return (
    <section id="kenapa" className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <h2
          data-section-header
          className="text-3xl md:text-5xl text-center text-black mb-16"
        >
          Keunggulan{" "}
          <span className="text-brand">Hosting Kami</span>
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="glass-card glass rounded-2xl p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <item.icon size={24} />
              </div>
              <h3 className="text-xl text-black mb-2">{item.title}</h3>
              <p className="text-black/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
