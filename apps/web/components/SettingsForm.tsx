"use client";

import { useState } from "react";
import type { User } from "@/lib/types";

const PROVIDERS: { id: string; name: string; defaultModel: string; models: string[]; keyPrefix: string }[] = [
  { id: "openai", name: "OpenAI", defaultModel: "gpt-4o-mini", models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1", "gpt-4.1-mini", "o1-mini", "o3-mini"], keyPrefix: "sk-" },
  { id: "anthropic", name: "Anthropic Claude", defaultModel: "claude-3-5-haiku-latest", models: ["claude-3-5-haiku-latest", "claude-3-5-sonnet-latest", "claude-3-opus-latest"], keyPrefix: "sk-ant-" },
  { id: "mimo", name: "Xiaomi MiMo", defaultModel: "mimo-v2-flash", models: ["mimo-v2-flash", "mimo-v2-omni", "mimo-v2-pro", "mimo-v2.5", "mimo-v2.5-pro"], keyPrefix: "sk-" },
  { id: "ollama", name: "Ollama (local)", defaultModel: "llama3.2", models: ["llama3.2", "llama3.1", "qwen2.5", "mistral", "gemma2"], keyPrefix: "" },
];

export function SettingsForm({ user }: { user: User }) {
  const [provider, setProvider] = useState(user.default_provider);
  const [model, setModel] = useState(user.default_model);
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [mimoKey, setMimoKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const currentProvider = PROVIDERS.find((p) => p.id === provider) ?? PROVIDERS[0];

  function onProviderChange(id: string) {
    setProvider(id);
    const p = PROVIDERS.find((x) => x.id === id);
    if (p) setModel(p.defaultModel);
  }

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
          onChange={(e) => onProviderChange(e.target.value)}
          className="field-input text-[0.85rem]"
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="label-mono mb-2">Default model</p>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          list="model-suggestions"
          placeholder={currentProvider.defaultModel}
          className="field-input text-[0.85rem] font-mono"
        />
        <datalist id="model-suggestions">
          {currentProvider.models.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <p className="text-[0.65rem] text-text-subtle mt-1.5 font-label-mono">
          Suggestions: {currentProvider.models.join(", ")}
        </p>
      </div>

      <div className="border-t border-white/5 pt-5">
        <p className="label-mono mb-3">API credentials</p>

        {provider === "openai" && (
          <KeyField
            label="OpenAI API key"
            set={user.has_openai_key}
            value={openaiKey}
            onChange={setOpenaiKey}
            placeholder="sk-..."
          />
        )}

        {provider === "anthropic" && (
          <KeyField
            label="Anthropic API key"
            set={user.has_anthropic_key}
            value={anthropicKey}
            onChange={setAnthropicKey}
            placeholder="sk-ant-..."
          />
        )}

        {provider === "mimo" && (
          <>
            <KeyField
              label="Xiaomi MiMo API key"
              value={mimoKey}
              onChange={setMimoKey}
              placeholder="sk-..."
            />
            <p className="text-[0.65rem] text-text-subtle mt-2 font-label-mono">
              Endpoint: <span className="text-pink-neon">https://api.xiaomimimo.com/v1</span> (OpenAI-compatible)
            </p>
          </>
        )}

        {provider === "ollama" && (
          <div>
            <p className="label-mono mb-2">Ollama base URL</p>
            <input
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="field-input text-[0.85rem] font-mono"
            />
            <p className="text-[0.65rem] text-text-subtle mt-1.5 font-label-mono">
              Local Ollama. No API key needed.
            </p>
          </div>
        )}

        {provider !== "openai" && provider !== "anthropic" && provider !== "mimo" && provider !== "ollama" && (
          <p className="text-[0.75rem] text-on-surface-variant">
            No credentials required for this provider.
          </p>
        )}
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

function KeyField({
  label,
  value,
  onChange,
  placeholder,
  set = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  set?: boolean;
}) {
  return (
    <div>
      <p className="text-[0.7rem] text-on-surface-variant mb-1.5">
        {label} {set && <span className="text-success font-label-mono">(set)</span>}
      </p>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="field-input text-[0.85rem] font-mono"
      />
    </div>
  );
}
