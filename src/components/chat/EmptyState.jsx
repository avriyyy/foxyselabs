import { FoxLogo } from "./Icons"

const prompts = [
  ["Explain quantum computing simply", "Write a professional email"],
  ["Debug this React code", "Plan a 5-day Tokyo trip"],
  ["Summarize this article", "Give me startup ideas"],
]

export default function EmptyState({ onPromptClick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-24 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <FoxLogo size={48} />

        <h2 className="text-[#FADBE1] text-3xl md:text-4xl font-bold text-center">
          What can I help you with?
        </h2>

        <p className="text-[#E3BDC5] text-center text-sm md:text-base max-w-xl leading-relaxed">
          Ask anything — coding, writing, analysis, brainstorming, research, or just chat. I am here to help.
        </p>

        <div className="w-full flex flex-col gap-3">
          {prompts.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {row.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onPromptClick?.(prompt)}
                  className="h-16 px-4 rounded-lg bg-[#27171B]/80 border border-white/10 text-[#E3BDC5] text-sm text-left hover:border-pink-neon/30 hover:bg-white/5 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
