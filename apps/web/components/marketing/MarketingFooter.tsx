import Logo from "../Logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <Logo size={24} />
          <span className="font-display-md text-[0.95rem] tracking-tighter">
            <span className="text-on-surface">Foxyse</span>
            <span className="text-pink-neon">Labs</span>
            <span className="text-on-surface">.</span>
          </span>
        </div>
        <p className="text-[0.7rem] font-label-mono uppercase tracking-widest text-text-subtle">
          Self-hosted AI Agent platform. MIT licensed.
        </p>
      </div>
    </footer>
  );
}
