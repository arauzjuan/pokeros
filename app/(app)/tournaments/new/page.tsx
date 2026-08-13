import { PageHeader } from "@/components/page-header";
import { TournamentForm } from "@/components/tournaments/tournament-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewTournamentPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_currency")
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Registrar torneo" subtitle="Cargá un nuevo resultado en PokerOS." />
      <TournamentForm defaultCurrency={profile?.default_currency ?? "USD"} />
    </div>
  );
}
