import { PackageSearch, Globe, CreditCard, Rocket } from "lucide-react";

const steps = [
  {
    icon: PackageSearch,
    title: "Pilih Paket",
    desc: "Tentukan paket hosting yang paling sesuai dengan kebutuhan traffic dan spesifikasi websitemu.",
  },
  {
    icon: Globe,
    title: "Pilih Domain",
    desc: "Cari dan daftarkan nama domain gratis untuk websitemu, atau gunakan domain yang sudah ada.",
  },
  {
    icon: CreditCard,
    title: "Pembayaran",
    desc: "Selesaikan pembayaran dengan berbagai metode yang tersedia, proses otomatis dan cepat.",
  },
  {
    icon: Rocket,
    title: "Website Online",
    desc: "Hosting dan domain langsung aktif. Kamu siap mengupload file atau menginstal WordPress.",
  },
];

export default function CaraKerja() {
  return (
    <section id="cara" className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <h2
          data-section-header
          className="text-3xl md:text-5xl text-center text-black mb-16"
        >
          Cara <span className="text-brand">Kerja</span>
        </h2>

        <div className="grid gap-6 md:grid-cols-4 relative">
          {steps.map((step, i) => (
            <div key={step.title} className="glass-card glass rounded-2xl p-6 relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <step.icon size={24} />
              </div>
              <div className="absolute top-6 right-6 text-3xl text-black/10 font-bold">
                0{i + 1}
              </div>
              <h3 className="text-xl text-black mb-2">{step.title}</h3>
              <p className="text-black/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
