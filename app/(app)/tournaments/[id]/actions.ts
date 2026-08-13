"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type DeleteTournamentState = { error?: string };

export async function deleteTournament(
  tournamentId: string,
  _previousState: DeleteTournamentState,
): Promise<DeleteTournamentState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/tournaments/${tournamentId}`);

  const { error } = await supabase.rpc("delete_tournament_result", {
    p_tournament_id: tournamentId,
  });

  if (error?.message.includes("TOURNAMENT_NOT_FOUND")) {
    return { error: "El torneo no existe o no tenés permiso para eliminarlo." };
  }
  if (error) return { error: "No pudimos eliminar el resultado. Intentá nuevamente." };

  revalidatePath("/tournaments");
  revalidatePath("/dashboard");
  redirect("/tournaments?deleted=1");
}
