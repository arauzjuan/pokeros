import { redirect } from "next/navigation";

import { BankrollForm } from "@/app/onboarding/bankroll/bankroll-form";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function BankrollOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/bankroll");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, country, primary_game_type, default_currency, onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed_at) {
    redirect("/dashboard");
  }

  if (!profile?.display_name || !profile.country || !profile.primary_game_type) {
    redirect("/onboarding");
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.68_0.16_250/0.12),transparent_38%)]" />
      <div className="relative w-full max-w-xl">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <Card className="border-border/70 shadow-2xl shadow-black/20">
          <CardHeader className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Paso 2 de 2</p>
            <CardTitle className="text-2xl">Configurá tu bankroll</CardTitle>
            <CardDescription>
              Definí tu capital inicial para que PokerOS pueda calcular métricas y riesgo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BankrollForm defaultCurrency={profile.default_currency} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
