import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings — FoxyseLabs" };

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <main className="min-h-screen pt-24 pb-24 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto">
      <h1 className="text-display-md font-display-md text-on-surface mb-2">Settings</h1>
      <p className="text-[0.85rem] text-on-surface-variant mb-8">
        Configure your model provider and API keys. All keys are encrypted at rest.
      </p>
      <SettingsForm user={user} />
    </main>
  );
}
