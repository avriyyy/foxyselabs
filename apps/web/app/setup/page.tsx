import { SetupForm } from "@/components/SetupForm";

export const metadata = { title: "Setup — FoxyseLabs" };

export default function SetupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <SetupForm />
    </main>
  );
}
