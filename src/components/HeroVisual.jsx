import Logo from "./Logo"

export default function HeroVisual() {
  return (
    <div className="relative h-[260px] sm:h-[300px] md:h-[340px] lg:h-[380px] stitch-node-glass rounded-xl overflow-hidden border border-white/5 bg-surface-container-low flex flex-col">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 bg-black/20 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-pink-neon/80" />
          <div className="w-3 h-3 rounded-full bg-pink-neon/50" />
          <div className="w-3 h-3 rounded-full bg-pink-neon/30" />
        </div>
        <div className="ml-4 flex items-center gap-2 text-[11px] text-white/30 font-mono">
          <span className="text-pink-neon/50">●</span>
          FoxyseLabs
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,127,0.08)_0,transparent_70%)]" />
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center gap-2 max-w-full px-2">
          <pre
            className="text-pink-neon/60 leading-relaxed text-center select-none text-[5px] sm:text-[5.5px] md:text-[6px] lg:text-[8px] max-w-full"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
{`$$$$$$$$                                                $$\\                $$\\                     
$$  _____|                                               $$ |               $$ |                    
$$ |    $$$$$$\\  $$\\   $$\\ $$\\   $$\\  $$$$$$$\\  $$$$$$\\  $$ |      $$$$$$\\  $$$$$$$\\   $$$$$$$\\     
$$$$$\\ $$  __$$\\ \\$$\\ $$  |$$ |  $$ |$$  _____|$$  __$$\\ $$ |      \\____$$\\ $$  __$$\\ $$  _____|    
$$  __|$$ /  $$ | \\$$$$  / $$ |  $$ |\\$$$$$$\\  $$$$$$$$ |$$ |      $$$$$$$ |$$ |  $$ |\\$$$$$$\\      
$$ |   $$ |  $$ | $$  $$<  $$ |  $$ | \\____$$\\ $$   ____|$$ |     $$  __$$ |$$ |  $$ | \\____$$\\     
$$ |   \\$$$$$$  |$$  /\\$$\\ \\$$$$$$$ |$$$$$$$  |\\$$$$$$$\\ $$$$$$$$\\\\$$$$$$$ |$$$$$$$  |$$$$$$$  |$$\\ 
\\__|    \\______/ \\__/  \\__| \\____$$ |\\_______/  \\_______|\\________|\\_______|\\_______/ \\_______/ \\__|
                           $$\\   $$ |                                                               
                           \\$$$$$$  |                                                               
                            \\______/                                                                `}
          </pre>
          <Logo size={24} className="opacity-40" />
        </div>
      </div>
    </div>
  )
}
