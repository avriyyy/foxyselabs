import Logo from "./Logo";

const cols = [
  { title: "Layanan", links: ["Shared Hosting", "Cloud Hosting", "Registrasi Domain", "Transfer Domain"] },
  { title: "Perusahaan", links: ["Tentang Kami", "Blog", "Kontak"] },
  { title: "Bantuan", links: ["Knowledge Base", "Kirim Tiket", "FAQ"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 mt-10">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 text-black/55 max-w-xs">
              Layanan web hosting murah dan andal dengan server super cepat, uptime 99.9%, dan support 24/7.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-black text-lg mb-3">{c.title}</h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-black/55 hover:text-brand transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-black/40 text-sm">
            © 2026 FoxyseLabs. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-black/50">
            <a href="#" className="hover:text-brand transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand transition-colors">Terms</a>
            <a href="#" className="hover:text-brand transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
