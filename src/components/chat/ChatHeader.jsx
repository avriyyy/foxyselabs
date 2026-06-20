import { ShareIcon } from "./Icons"

export default function ChatHeader() {
  return (
    <header className="h-16 px-7 flex items-center justify-between shrink-0 bg-[#2C1B1F]/40 backdrop-blur-xl border-b border-white/5">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[#FADBE1] font-semibold text-base">Foxyse Chat</h1>
        <p className="text-[#94949E] font-mono text-[9px] tracking-wider uppercase">FOXYSE K2.6 · 128K CONTEXT</p>
      </div>

      <button className="h-8 px-3 rounded border border-white/10 flex items-center gap-2 hover:border-pink-neon/30 hover:bg-white/5 transition-colors">
        <ShareIcon size={16} />
        <span className="hidden sm:inline text-[#E3BDC5] font-mono text-[10px] font-semibold tracking-wider">SHARE</span>
      </button>
    </header>
  )
}
