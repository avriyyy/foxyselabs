import { Itim } from "next/font/google";
import "./globals.css";

const itim = Itim({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ink",
  display: "swap",
});

export const metadata = {
  title: "FoxyseLabs. — Template Website dengan Tema Customizable",
  description:
    "Template website profesional untuk E-Commerce dan POS Sistem dengan tema Basic Dark dan Basic Light. Dapatkan source code lengkap.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={itim.variable}>
      <body className="font-ink antialiased">{children}</body>
    </html>
  );
}
