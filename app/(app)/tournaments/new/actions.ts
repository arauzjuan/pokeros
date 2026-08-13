"use server";

import { redirect } from "next/navigation";

import { calculateTotalInvested } from "@/lib/tournament-calculations";
import { createClient } from "@/lib/supabase/server";

export type InvestmentState = {
  error?: string;
  totalInvested?: number;
};

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
    const totalInvested = calculateTotalInvested({
      buyIn: Number(formData.get("buyIn")),
      reentries: Number(formData.get("reentries") || 0),
      reentryCost: Number(formData.get("reentryCost") || 0),
    });

    return { totalInvested };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No pudimos calcular la inversión.",
    };
  }
}
