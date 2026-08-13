import "server-only";

import { createClient } from "@/lib/supabase/server";

export type PlayerMetrics = {
  bankroll: number;
  tournaments: number;
  totalInvested: number;
  totalReturns: number;
  profit: number;
  roi: number;
  abi: number;
  itm: number;
};

export type MetricsRange = "7_days" | "30_days" | "this_month" | "this_year" | "all_time";

export const metricsRanges: { value: MetricsRange; label: string }[] = [
  { value: "7_days", label: "7 días" },
  { value: "30_days", label: "30 días" },
  { value: "this_month", label: "Este mes" },
  { value: "this_year", label: "Este año" },
  { value: "all_time", label: "Todo el historial" },
];

type MetricsPayload = {
  total_tournaments?: number | string;
  total_invested?: number | string;
  total_returns?: number | string;
  total_profit?: number | string;
  roi?: number | string;
  abi?: number | string;
  itm?: number | string;
};

const emptyMetrics: PlayerMetrics = {
  bankroll: 0,
  tournaments: 0,
  totalInvested: 0,
  totalReturns: 0,
  profit: 0,
  roi: 0,
  abi: 0,
  itm: 0,
};

export async function getPlayerMetrics(range: MetricsRange = "all_time"): Promise<PlayerMetrics> {
  const supabase = await createClient();
  const [{ data: payload, error: metricsError }, { data: bankroll, error: bankrollError }] =
    await Promise.all([
      supabase.rpc("player_metrics_by_range", { p_range: range }),
      supabase.rpc("current_bankroll"),
    ]);

  if (metricsError || bankrollError || !payload || typeof payload !== "object") {
    return emptyMetrics;
  }

  const metrics = payload as MetricsPayload;
  return {
    bankroll: Number(bankroll ?? 0),
    tournaments: Number(metrics.total_tournaments ?? 0),
    totalInvested: Number(metrics.total_invested ?? 0),
    totalReturns: Number(metrics.total_returns ?? 0),
    profit: Number(metrics.total_profit ?? 0),
    roi: Number(metrics.roi ?? 0),
    abi: Number(metrics.abi ?? 0),
    itm: Number(metrics.itm ?? 0),
  };
}
