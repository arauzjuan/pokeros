"use server";

import { redirect } from "next/navigation";

import { calculateTournamentFinancials } from "@/lib/tournament-calculations";
import { createClient } from "@/lib/supabase/server";

export type InvestmentState = {
  error?: string;
};

const validPlatforms = new Set(["ggpoker", "pokerstars", "wpt-global", "acr", "888poker", "live", "other"]);
const validModes = new Set(["mtt", "pko", "mystery-bounty", "sit-and-go", "cash"]);
const validCurrencies = new Set(["USD", "EUR", "ARS", "BRL", "GBP", "MXN"]);

function optionalInteger(value: FormDataEntryValue | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

export async function prepareTournament(
  _previousState: InvestmentState,
  formData: FormData,
): Promise<InvestmentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/tournaments/new");
  }

  try {
    const name = String(formData.get("name") ?? "").trim();
    const playedAt = String(formData.get("playedAt") ?? "");
    const platform = String(formData.get("platform") ?? "");
    const mode = String(formData.get("mode") ?? "");
    const currency = String(formData.get("currency") ?? "");
    const notes = String(formData.get("notes") ?? "").trim();
    const finishPosition = optionalInteger(formData.get("position"));
    const fieldSize = optionalInteger(formData.get("fieldSize"));
    const values = {
      buyIn: Number(formData.get("buyIn")),
      reentries: Number(formData.get("reentries") || 0),
      reentryCost: Number(formData.get("reentryCost") || 0),
      prize: Number(formData.get("prize") || 0),
      bounties: Number(formData.get("bounties") || 0),
    };

    calculateTournamentFinancials(values);

    if (name.length < 2 || name.length > 120) {
      return { error: "Ingresá un nombre de torneo válido." };
    }

    const parsedDate = new Date(`${playedAt}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(playedAt) || Number.isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
      return { error: "Seleccioná una fecha válida que no esté en el futuro." };
    }

    if (!validPlatforms.has(platform) || !validModes.has(mode) || !validCurrencies.has(currency)) {
      return { error: "Revisá la plataforma, modalidad y moneda seleccionadas." };
    }

    if ((finishPosition !== null && !Number.isFinite(finishPosition))
      || (fieldSize !== null && !Number.isFinite(fieldSize))) {
      return { error: "La posición y el field size deben ser números enteros." };
    }

    if ((finishPosition !== null && finishPosition < 1)
      || (fieldSize !== null && fieldSize < 1)
      || (finishPosition !== null && fieldSize !== null && finishPosition > fieldSize)) {
      return { error: "La posición final debe estar dentro del field size." };
    }

    if (notes.length > 1000) {
      return { error: "Las notas no pueden superar los 1000 caracteres." };
    }

    const { error: saveError } = await supabase.rpc("save_tournament_result", {
      p_name: name,
      p_played_at: playedAt,
      p_platform: platform,
      p_mode: mode,
      p_currency: currency,
      p_buy_in: values.buyIn,
      p_reentries: values.reentries,
      p_reentry_cost: values.reentryCost,
      p_prize: values.prize,
      p_bounties: values.bounties,
      p_finish_position: finishPosition,
      p_field_size: fieldSize,
      p_notes: notes || null,
    });

    if (saveError) {
      if (saveError.message.includes("ACTIVE_BANKROLL_ACCOUNT_NOT_FOUND")) {
        return { error: "No encontramos un bankroll activo en la moneda seleccionada." };
      }

      return { error: "No pudimos guardar el resultado. Intentá nuevamente." };
    }

  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No pudimos guardar el resultado.",
    };
  }

  redirect("/tournaments?created=1");
}
