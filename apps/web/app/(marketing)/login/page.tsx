import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign in — FoxyseLabs" };

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <AuthForm initialTab="login" />
    </main>
  );
}
