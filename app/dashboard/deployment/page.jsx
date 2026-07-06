"use client";

import { useState } from "react";
import { Rocket, Server, Github, CheckCircle2, AlertCircle } from "lucide-react";

export default function DeploymentPage() {
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, deploying, success, error
  const [formData, setFormData] = useState({
    projectName: "",
    repoUrl: "",
    template: "nextjs",
  });

  const handleDeploy = async (e) => {
    e.preventDefault();
    setDeploying(true);
    setStatus("deploying");

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to deploy");
      
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-black">Website Deployment</h1>
        <p className="text-black/60 mt-1 text-sm">Deploy aplikasi atau website Anda dengan cepat dan mudah ke cloud.</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {status === "success" ? (
            <div className="text-center py-12">
              <div className="h-20 w-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-semibold text-black mb-2">Deployment Berhasil!</h2>
              <p className="text-black/60 max-w-md mx-auto mb-8">
                Website {formData.projectName} sedang di-deploy. Proses ini membutuhkan waktu beberapa menit.
              </p>
              <button 
                onClick={() => setStatus("idle")}
                className="btn-brand px-6 py-2 rounded-xl"
              >
                Deploy Lagi
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeploy} className="space-y-6">
              {status === "error" && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle size={18} />
                  Gagal melakukan deployment. Pastikan API Token Coolify Anda sudah diset di .env
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-black mb-2">Nama Project</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: my-awesome-store"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">URL Repository GitHub (Opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Github size={18} className="text-black/40" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://github.com/username/repo"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    value={formData.repoUrl}
                    onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-3">Atau Pilih Template</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-colors ${formData.template === "nextjs" ? "border-brand bg-brand/5" : "border-black/10 hover:border-black/20"}`}>
                    <input type="radio" name="template" value="nextjs" className="hidden" checked={formData.template === "nextjs"} onChange={() => setFormData({ ...formData, template: "nextjs" })} />
                    <div className="h-10 w-10 bg-black text-white rounded-lg flex items-center justify-center shrink-0">
                      <span className="font-bold text-xs">NEXT</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">Next.js App</h4>
                      <p className="text-xs text-black/50">React framework untuk production</p>
                    </div>
                  </label>
                  
                  <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-colors ${formData.template === "react" ? "border-brand bg-brand/5" : "border-black/10 hover:border-black/20"}`}>
                    <input type="radio" name="template" value="react" className="hidden" checked={formData.template === "react"} onChange={() => setFormData({ ...formData, template: "react" })} />
                    <div className="h-10 w-10 bg-blue-500 text-white rounded-lg flex items-center justify-center shrink-0">
                      <Server size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">React Vite</h4>
                      <p className="text-xs text-black/50">Vite JS SPA template</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 flex justify-end">
                <button
                  type="submit"
                  disabled={deploying}
                  className="btn-brand px-8 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deploying ? (
                    <>Memproses...</>
                  ) : (
                    <>
                      <Rocket size={18} /> Deploy Sekarang
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
