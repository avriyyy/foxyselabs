import { useState, useRef, useEffect } from "react"
import { UploadIcon, BrowserIcon, ThinkingIcon, AgentIcon, SendIcon, ChevronDownIcon } from "./Icons"

function ToolbarButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-7 px-2.5 rounded border border-white/10 flex items-center gap-1.5 text-[#94949E] hover:border-pink-neon/30 hover:bg-white/5 hover:text-[#FADBE1] transition-colors"
    >
      <Icon size={14} />
      {label && <span className="font-mono text-[9px]">{label}</span>}
    </button>
  )
}

export default function InputArea({ onSend, disabled }) {
  const [input, setInput] = useState("")
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  function send() {
    const text = input.trim()
    if (!text || disabled) return
    onSend?.(text)
    setInput("")
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="px-6 md:px-28 pb-6 pt-4 flex flex-col items-center gap-3 shrink-0">
      <div className="w-full max-w-4xl min-h-[120px] rounded-lg bg-[#27171B]/80 border border-white/10 p-4 flex flex-col justify-between">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message Foxyse..."
          rows={1}
          className="bg-transparent text-[#FADBE1] text-sm placeholder:text-[#94949E] outline-none resize-none w-full"
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <ToolbarButton icon={UploadIcon} />
            <ToolbarButton icon={BrowserIcon} label="Browser" />
            <ToolbarButton icon={ThinkingIcon} label="Thinking" />
            <ToolbarButton icon={AgentIcon} label="Agent" />
          </div>

          <div className="flex items-center gap-2">
            <button className="h-7 px-2.5 rounded border border-white/10 flex items-center gap-1.5 text-[#E3BDC5] hover:border-pink-neon/30 hover:bg-white/5 transition-colors">
              <span className="text-xs">Foxyse K2.6</span>
              <ChevronDownIcon size={8} />
            </button>

            <button
              onClick={send}
              disabled={!input.trim() || disabled}
              className="w-9 h-9 rounded bg-[#ff4a8e] flex items-center justify-center text-[#FADBE1] hover:bg-[#FF007F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-[0_0_15px_rgba(255,0,127,0.15)]"
            >
              <SendIcon size={18} stroke="#FADBE1" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[#94949E] font-mono text-[9px]">
        Foxyse can make mistakes. Please verify important information.
      </p>
    </div>
  )
}
