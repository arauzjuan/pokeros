import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { TournamentForm, type TournamentFormValues } from "@/components/tournaments/tournament-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("id, starts_at, name, platform, mode, currency, buy_in, reentries, reentry_cost, prize, bounties, finish_position, field_size, notes")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const initialValues: TournamentFormValues = {
    id: data.id,
    playedAt: data.starts_at.slice(0, 10),
    name: data.name,
    platform: data.platform,
    mode: data.mode,
    currency: data.currency,
    buyIn: Number(data.buy_in),
    reentries: Number(data.reentries),
    reentryCost: Number(data.reentry_cost),
    prize: Number(data.prize),
    bounties: Number(data.bounties),
    position: data.finish_position,
    fieldSize: data.field_size,
    notes: data.notes ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Editar resultado" subtitle={`Actualizá los datos de ${data.name}.`} />
      <TournamentForm defaultCurrency={data.currency} initialValues={initialValues} />
    </div>
  );
}
