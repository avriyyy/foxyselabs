"use client";

import { useState } from "react";
import { Database, CheckCircle2, AlertCircle } from "lucide-react";

export default function DatabaseDeploymentPage() {
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, deploying, success, error
  const [formData, setFormData] = useState({
    name: "",
    type: "postgresql",
    version: "15",
    isPublic: false,
    customUser: "",
    customPassword: ""
  });
  const [deployedData, setDeployedData] = useState(null);

  const handleDeploy = async (e) => {
    e.preventDefault();
    setDeploying(true);
    setStatus("deploying");

    try {
      const res = await fetch("/api/deploy-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to deploy database");
      
      const data = await res.json();
      setDeployedData(data);
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
        <h1 className="text-2xl font-semibold text-black">Deploy Database</h1>
        <p className="text-black/60 mt-1 text-sm">Buat dan deploy instance database baru dengan mudah ke cloud.</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {status === "success" ? (
            <div className="text-center py-12">
              <div className="h-20 w-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-semibold text-black mb-2">Database Berhasil Dideploy!</h2>
              <p className="text-black/60 max-w-md mx-auto mb-8">
                Database {formData.name} sedang dikonfigurasi. Ini membutuhkan waktu beberapa menit.
              </p>
              <button 
                onClick={() => {
                  setStatus("idle");
                  setFormData({ name: "", type: "postgresql", version: "15" });
                }}
                className="btn-brand px-6 py-2 rounded-xl"
              >
                Deploy Database Lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeploy} className="space-y-6">
              {status === "error" && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle size={18} />
                  Gagal melakukan deployment. Pastikan API Token Coolify Anda sudah diset.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-black mb-2">Nama Database</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: db-production"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-3">Tipe Database</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-colors ${formData.type === "postgresql" ? "border-brand bg-brand/5" : "border-black/10 hover:border-black/20"}`}>
                    <input type="radio" name="type" value="postgresql" className="hidden" checked={formData.type === "postgresql"} onChange={() => setFormData({ ...formData, type: "postgresql", version: "15" })} />
                    <div className="h-10 w-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
                      <Database size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">PostgreSQL</h4>
                      <p className="text-xs text-black/50">Database Relasional</p>
                    </div>
                  </label>
                  
                  <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-colors ${formData.type === "mysql" ? "border-brand bg-brand/5" : "border-black/10 hover:border-black/20"}`}>
                    <input type="radio" name="type" value="mysql" className="hidden" checked={formData.type === "mysql"} onChange={() => setFormData({ ...formData, type: "mysql", version: "8.0" })} />
                    <div className="h-10 w-10 bg-orange-500 text-white rounded-lg flex items-center justify-center shrink-0">
                      <Database size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">MySQL</h4>
                      <p className="text-xs text-black/50">Database Relasional</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Versi</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                >
                  {formData.type === "postgresql" ? (
                    <>
                      <option value="15">PostgreSQL 15</option>
                      <option value="16">PostgreSQL 16</option>
                      <option value="14">PostgreSQL 14</option>
                    </>
                  ) : (
                    <>
                      <option value="8.0">MySQL 8.0</option>
                      <option value="5.7">MySQL 5.7</option>
                    </>
                  )}
                </select>
              </div>

              <div className="border-t border-black/5 pt-6 mt-6">
                <h3 className="font-medium text-black mb-4">Pengaturan Lanjutan (Opsional)</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-brand focus:ring-brand"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    />
                    <div>
                      <span className="block text-sm font-medium text-black">Akses Publik</span>
                      <span className="block text-xs text-black/50">Izinkan database diakses dari luar jaringan (membutuhkan Public Port)</span>
                    </div>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-black/70 mb-1">Custom Username</label>
                      <input
                        type="text"
                        placeholder="Default jika kosong"
                        className="w-full px-4 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:border-brand"
                        value={formData.customUser}
                        onChange={(e) => setFormData({ ...formData, customUser: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-black/70 mb-1">Custom Password</label>
                      <input
                        type="password"
                        placeholder="Auto-generate jika kosong"
                        className="w-full px-4 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:border-brand"
                        value={formData.customPassword}
                        onChange={(e) => setFormData({ ...formData, customPassword: e.target.value })}
                      />
                    </div>
                  </div>
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
                      <Database size={18} /> Deploy Database
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
