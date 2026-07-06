import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import KenapaPilihKami from "@/components/KenapaPilihKami";
import PilihanTemplate from "@/components/PilihanTemplate";
import CaraKerja from "@/components/CaraKerja";
import UntukSiapa from "@/components/UntukSiapa";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

const headerGroup = { selector: "[data-section-header]", y: 30 };
const cardsGroup = { selector: ".glass-card", y: 36, stagger: 0.12 };

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <Reveal y={28} start="top 95%">
        <Hero />
      </Reveal>

      <Reveal groups={[headerGroup, cardsGroup]}>
        <KenapaPilihKami />
      </Reveal>
      <Reveal groups={[headerGroup, cardsGroup]}>
        <PilihanTemplate />
      </Reveal>
      <Reveal groups={[headerGroup, cardsGroup]}>
        <CaraKerja />
      </Reveal>
      <Reveal groups={[headerGroup, cardsGroup]}>
        <UntukSiapa />
      </Reveal>

      <Reveal
        groups={[{ selector: ".glass-cta", y: 40, duration: 1 }]}
      >
        <CTA />
      </Reveal>

      <Footer />
    </main>
  );
}
