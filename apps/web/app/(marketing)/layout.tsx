import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { getSessionUser } from "@/lib/session";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingNav user={user} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
