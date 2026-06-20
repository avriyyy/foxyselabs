"use client";

import { useState } from "react";
import type { User } from "@/lib/types";

export function SettingsForm({ user }: { user: User }) {
  const [provider, setProvider] = useState(user.default_provider);
  const [model, setModel] = useState(user.default_model);
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    // Sprint 1: settings persistence endpoint not yet built.
    // This is a UI placeholder; values are kept in component state.
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setMsg("Settings persistence ships in Sprint 2. UI ready.");
  }

  return (
    <div className="stitch-node-glass p-6 md:p-8 space-y-6">
      <div>
        <p className="label-mono mb-2">Default provider</p>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="field-input text-[0.85rem]"
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="ollama">Ollama (local)</option>
        </select>
      </div>

      <div>
        <p className="label-mono mb-2">Default model</p>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="gpt-4o-mini"
          className="field-input text-[0.85rem]"
        />
      </div>

      <div>
        <p className="label-mono mb-2">OpenAI API key {user.has_openai_key && <span className="text-success">(set)</span>}</p>
        <input
          type="password"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
          placeholder="sk-..."
          autoComplete="off"
          className="field-input text-[0.85rem] font-mono"
        />
      </div>

      <div>
        <p className="label-mono mb-2">Anthropic API key {user.has_anthropic_key && <span className="text-success">(set)</span>}</p>
        <input
          type="password"
          value={anthropicKey}
          onChange={(e) => setAnthropicKey(e.target.value)}
          placeholder="sk-ant-..."
          autoComplete="off"
          className="field-input text-[0.85rem] font-mono"
        />
      </div>

      {msg && (
        <p className="text-[0.75rem] font-label-mono text-pink-neon px-3 py-2 bg-pink-neon/10 border border-pink-neon/30">
          {msg}
        </p>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="btn-primary-filled w-full py-3 text-[0.65rem] font-label-mono uppercase tracking-widest"
      >
        {saving ? "Saving" : "Save settings"}
      </button>
    </div>
  );
}
