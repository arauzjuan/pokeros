"use server";

import { redirect } from "next/navigation";

import type { InvestmentState } from "@/app/(app)/tournaments/new/actions";
import { calculateTournamentFinancials } from "@/lib/tournament-calculations";
import { createClient } from "@/lib/supabase/server";

const validPlatforms = new Set(["ggpoker", "pokerstars", "wpt-global", "acr", "888poker", "live", "other"]);
const validModes = new Set(["mtt", "pko", "mystery-bounty", "sit-and-go", "cash"]);
const validCurrencies = new Set(["USD", "EUR", "ARS", "BRL", "GBP", "MXN"]);

function optionalInteger(value: FormDataEntryValue | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

export async function updateTournament(
  tournamentId: string,
  _previousState: InvestmentState,
  formData: FormData,
): Promise<InvestmentState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/tournaments/${tournamentId}/edit`);

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
    const parsedDate = new Date(`${playedAt}T00:00:00Z`);

    if (name.length < 2 || name.length > 120) return { error: "Ingresá un nombre de torneo válido." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(playedAt) || Number.isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
      return { error: "Seleccioná una fecha válida que no esté en el futuro." };
    }
    if (!validPlatforms.has(platform) || !validModes.has(mode) || !validCurrencies.has(currency)) {
      return { error: "Revisá la plataforma, modalidad y moneda seleccionadas." };
    }
    if ((finishPosition !== null && (!Number.isFinite(finishPosition) || finishPosition < 1))
      || (fieldSize !== null && (!Number.isFinite(fieldSize) || fieldSize < 1))
      || (finishPosition !== null && fieldSize !== null && finishPosition > fieldSize)) {
      return { error: "La posición final debe estar dentro del field size." };
    }
    if (notes.length > 1000) return { error: "Las notas no pueden superar los 1000 caracteres." };

    const { error } = await supabase.rpc("update_tournament_result", {
      p_tournament_id: tournamentId,
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

    if (error?.message.includes("ACTIVE_BANKROLL_ACCOUNT_NOT_FOUND")) {
      return { error: "No encontramos un bankroll activo en la moneda seleccionada." };
    }
    if (error?.message.includes("TOURNAMENT_NOT_FOUND")) {
      return { error: "El torneo no existe o no tenés permiso para editarlo." };
    }
    if (error) return { error: "No pudimos guardar los cambios. Intentá nuevamente." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No pudimos guardar los cambios." };
  }

  redirect(`/tournaments/${tournamentId}?updated=1`);
}
