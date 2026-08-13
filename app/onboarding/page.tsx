import { redirect } from "next/navigation";

import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed_at) {
    redirect("/dashboard");
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Paso 1 de 2</p>
            <CardTitle className="text-2xl">Configurá tu perfil</CardTitle>
            <CardDescription>
              Estos datos nos ayudan a adaptar PokerOS a tu carrera y tus resultados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
