import { useState, useRef, useEffect } from "react"
import Sidebar from "../components/chat/Sidebar"
import ChatHeader from "../components/chat/ChatHeader"
import EmptyState from "../components/chat/EmptyState"
import InputArea from "../components/chat/InputArea"

const MOCK_RESPONSES = [
  "I can help you with that! Let me analyze your request and get back to you with a detailed response.",
  "That's an interesting question. Based on my analysis, I'd recommend exploring a few different approaches to solve this problem.",
  "Great point! Let me break this down: first, we need to understand the core requirements, then we can build a solution step by step.",
  "I've looked into this and here's what I found: there are several ways to approach this, but the most efficient method would be...",
  "Thanks for sharing that context. Let me synthesize what you've told me and provide some actionable insights.",
  "From what I understand, you're looking to optimize this workflow. Here are three strategies I'd suggest...",
  "Let me consult my knowledge base on this topic... Based on the latest information, here's my recommendation.",
  "I see the challenge you're describing. The key insight here is that we need to think about this from a different angle.",
]

export default function ChatPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  function send(text) {
    if (!text.trim() || typing) return
    const userMsg = { role: "user", text: text.trim(), time: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setTyping(true)

    setTimeout(() => {
      const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
      setMessages((prev) => [...prev, { role: "agent", text: response, time: new Date().toISOString() }])
      setTyping(false)
    }, 800 + Math.random() * 1400)
  }

  return (
    <main className="h-screen w-screen flex bg-[#1E0F13] text-[#FADBE1] overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <section className="flex-1 flex flex-col min-w-0">
        <ChatHeader />

        {messages.length === 0 && !typing ? (
          <EmptyState onPromptClick={send} />
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-28 py-6">
            <div className="max-w-3xl mx-auto space-y-5">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-[#27171B]/80 border border-white/10 rounded px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF007F] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF007F] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF007F] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <InputArea onSend={send} disabled={typing} />
      </section>
    </main>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user"
  const time = new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? "order-1" : "order-1"}`}>
        <div
          className={`rounded px-4 py-2.5 md:px-5 md:py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-[#FF007F]/20 border border-[#FF007F]/30 text-[#FADBE1]"
              : "bg-[#27171B]/80 border border-white/10 text-[#FADBE1]"
          }`}
        >
          {msg.text}
        </div>
        <p className={`text-[10px] font-mono text-[#94949E] mt-1 ${isUser ? "text-right" : "text-left"}`}>{time}</p>
      </div>
    </div>
  )
}
