"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type OnboardingState = {
  error?: string;
};

const supportedCurrencies = new Set(["USD", "EUR", "ARS", "BRL", "GBP", "MXN"]);
const supportedGameTypes = new Set(["mtt", "cash", "mixed"]);

export async function saveOnboarding(
  _previousState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const defaultCurrency = String(formData.get("defaultCurrency") ?? "");
  const primaryGameType = String(formData.get("primaryGameType") ?? "");

  if (displayName.length < 2 || displayName.length > 80) {
    return { error: "Ingresá un nombre de entre 2 y 80 caracteres." };
  }

  if (country.length < 2 || country.length > 80) {
    return { error: "Ingresá un país válido." };
  }

  if (!supportedCurrencies.has(defaultCurrency)) {
    return { error: "Seleccioná una moneda principal válida." };
  }

  if (!supportedGameTypes.has(primaryGameType)) {
    return { error: "Seleccioná tu tipo de juego principal." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      country,
      default_currency: defaultCurrency,
      primary_game_type: primaryGameType,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    return { error: "No pudimos guardar tu perfil. Intentá nuevamente." };
  }

  redirect("/onboarding/bankroll");
}
