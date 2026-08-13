import "server-only";

import { createClient } from "@/lib/supabase/server";

export type RecentTournament = {
  id: string;
  name: string;
  startsAt: string;
  platform: string;
  invested: number;
  returned: number;
  profit: number;
  currency: string;
};

export async function getRecentTournaments(limit = 5): Promise<RecentTournament[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("id, name, starts_at, platform, total_invested, total_return, net_profit, currency")
    .eq("status", "completed")
    .order("starts_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 20));

  if (error) return [];
  return (data ?? []).map((tournament) => ({
    id: tournament.id,
    name: tournament.name,
    startsAt: tournament.starts_at,
    platform: tournament.platform,
    invested: Number(tournament.total_invested),
    returned: Number(tournament.total_return),
    profit: Number(tournament.net_profit),
    currency: tournament.currency,
  }));
}
