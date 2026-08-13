"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type BankrollState = {
  error?: string;
};

const supportedCurrencies = new Set(["USD", "EUR", "ARS", "BRL", "GBP", "MXN"]);

export async function saveInitialBankroll(
  _previousState: BankrollState,
  formData: FormData,
): Promise<BankrollState> {
  const rawBankroll = String(formData.get("bankroll") ?? "").replace(",", ".");
  const bankroll = Number(rawBankroll);
  const currency = String(formData.get("currency") ?? "");

  if (!Number.isFinite(bankroll) || bankroll < 0 || bankroll > 999999999999.99) {
    return { error: "Ingresá un bankroll válido, igual o mayor que cero." };
  }

  if (!supportedCurrencies.has(currency)) {
    return { error: "Seleccioná una moneda válida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/bankroll");
  }

  const { error: accountError } = await supabase.rpc("initialize_bankroll", {
    p_amount: bankroll,
    p_currency: currency,
  });

  if (accountError) {
    return { error: "No pudimos crear tu bankroll inicial. Intentá nuevamente." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      default_currency: currency,
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Guardamos el bankroll, pero no pudimos completar el onboarding. Reintentá." };
  }

  redirect("/dashboard");
}
