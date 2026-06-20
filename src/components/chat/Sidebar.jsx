import { FoxLogo, NewChatIcon, SearchIcon, SettingsIcon, SidebarCollapseIcon, AgentIcon } from "./Icons"

const recentChats = [
  "React performance tips",
  "Email rewrite request",
  "Travel itinerary Bali",
  "Python script help",
  "Meeting summary notes",
  "Recipe suggestions",
]

export default function Sidebar({ collapsed, onToggle }) {
  if (collapsed) {
    return (
      <aside className="w-16 h-full bg-[#2C1B1F]/50 border-r border-white/5 flex flex-col items-center py-3 gap-4 shrink-0">
        {/* Logo row */}
        <div className="w-full px-3 flex items-center justify-between">
          <FoxLogo size={24} />
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-white/5 transition-colors"
            title="Expand sidebar"
          >
            <SidebarCollapseIcon size={16} />
          </button>
        </div>

        {/* New chat */}
        <button className="w-9 h-9 rounded bg-[#ff4a8e] flex items-center justify-center hover:bg-[#FF007F] transition-colors shadow-[0_0_15px_rgba(255,0,127,0.15)]">
          <NewChatIcon size={16} stroke="#FFFFFF" />
        </button>

        {/* Search */}
        <button className="w-9 h-9 rounded border border-white/10 flex items-center justify-center hover:border-pink-neon/30 hover:bg-white/5 transition-colors">
          <SearchIcon size={16} />
        </button>

        <div className="flex-1" />

        {/* Settings */}
        <button className="w-9 h-9 rounded border border-white/10 flex items-center justify-center hover:border-pink-neon/30 hover:bg-white/5 transition-colors">
          <SettingsIcon size={16} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
      </aside>
    )
  }

  return (
    <aside className="w-[280px] h-full bg-[#2C1B1F]/50 border-r border-white/5 flex flex-col gap-4 p-4 shrink-0">
      {/* Logo row */}
      <div className="h-10 flex items-center justify-between px-0">
        <div className="flex items-center gap-2">
          <FoxLogo size={28} />
          <div className="flex items-center">
            <span className="text-[#FADBE1] font-semibold text-base tracking-tight">Foxyse</span>
            <span className="text-[#ff4a8e] font-semibold text-base tracking-tight">Labs</span>
            <span className="text-[#FADBE1] font-semibold text-base">.</span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded border border-white/10 hover:border-pink-neon/30 hover:bg-white/5 transition-colors"
          title="Collapse sidebar"
        >
          <SidebarCollapseIcon size={18} />
        </button>
      </div>

      {/* New chat button */}
      <button className="w-full h-9 rounded bg-[#ff4a8e] flex items-center justify-center gap-2 hover:bg-[#FF007F] transition-colors shadow-[0_0_15px_rgba(255,0,127,0.15)]">
        <NewChatIcon size={16} stroke="#FFFFFF" />
        <span className="text-white font-mono text-xs font-semibold tracking-wider">NEW CHAT</span>
      </button>

      {/* Agent label (non-dropdown) */}
      <div className="h-9 rounded flex items-center px-3 gap-2">
        <AgentIcon size={14} className="text-[#FADBE1]" />
        <span className="text-[#FADBE1] text-sm">Foxyse Chat</span>
      </div>

      {/* Recent header */}
      <p className="text-[#94949E] font-mono text-[10px] font-semibold tracking-wider mt-1">RECENT CONVERSATIONS</p>

      {/* Search */}
      <div className="h-9 rounded bg-[#27171B]/80 border border-white/10 flex items-center px-3 gap-2">
        <SearchIcon size={16} />
        <input
          type="text"
          placeholder="Search conversations..."
          className="bg-transparent text-sm text-[#FADBE1] placeholder:text-[#94949E] outline-none w-full"
        />
      </div>

      {/* Chat list */}
      <div className="flex flex-col">
        {recentChats.map((chat, i) => (
          <button
            key={i}
            className="h-9 px-2.5 rounded flex items-center text-left text-[#E3BDC5] text-xs hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
          >
            {chat}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0" />

      {/* User profile */}
      <div className="h-12 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
          <div className="flex flex-col">
            <span className="text-[#FADBE1] text-sm font-medium">Apriyudha</span>
            <span className="text-[#94949E] font-mono text-[9px]">Pro Plan</span>
          </div>
        </div>
        <button className="p-1.5 rounded border border-white/10 hover:border-pink-neon/30 hover:bg-white/5 transition-colors">
          <SettingsIcon size={16} />
        </button>
      </div>
    </aside>
  )
}
