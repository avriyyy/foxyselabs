import ComingSoon from "@/components/ComingSoon";

export default function Page() {
  const titles = {
    domain: "Manajemen Domain",
    templates: "Katalog Template",
    agents: "AI Agents",
    tagihan: "Tagihan & Pembayaran",
    tiket: "Tiket Bantuan",
    pengaturan: "Pengaturan Akun"
  };
  
  return <ComingSoon title={`${titles["'${dir}'"] || "Fitur"} Segera Hadir`} />;
}
