import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { tournamentModes, tournamentPlatforms } from "@/lib/tournaments";

const platformLabels = new Map<string, string>(tournamentPlatforms.map(({ label, value }) => [value, label]));
const modeLabels = new Map<string, string>(tournamentModes.map(({ label, value }) => [value, label]));

function formatMoney(value: number | string, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function TournamentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string }>;
}) {
  const { id } = await params;
  const { updated } = await searchParams;
  const supabase = await createClient();
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("id, name, starts_at, platform, mode, format, status, buy_in, reentries, reentry_cost, prize, bounties, total_invested, total_return, net_profit, currency, finish_position, field_size, notes")
    .eq("id", id)
    .maybeSingle();

  if (error || !tournament) {
    notFound();
  }

  const profit = Number(tournament.net_profit);

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="w-fit" render={<Link href="/tournaments" />}>
        <ArrowLeft className="size-4" />
        Volver al historial
      </Button>

      {updated === "1" && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300" role="status">
          El resultado y el bankroll se actualizaron correctamente.
        </div>
      )}

      <PageHeader title={tournament.name} subtitle={`Jugado el ${formatDate(tournament.starts_at)}`}>
        <Button variant="outline" render={<Link href={`/tournaments/${id}/edit`} />}>
          <Pencil className="size-4" /> Editar
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <FinancialCard label="Inversión total" value={formatMoney(tournament.total_invested, tournament.currency)} />
        <FinancialCard label="Retorno total" value={formatMoney(tournament.total_return, tournament.currency)} />
        <FinancialCard
          label="Profit neto"
          value={formatMoney(profit, tournament.currency)}
          tone={profit < 0 ? "negative" : "positive"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Información del torneo</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Detail label="Fecha" value={formatDate(tournament.starts_at)} />
            <Detail label="Estado" value={tournament.status === "completed" ? "Completado" : tournament.status} />
            <Detail label="Plataforma" value={platformLabels.get(tournament.platform) ?? tournament.platform} />
            <Detail label="Modalidad" value={modeLabels.get(tournament.mode) ?? tournament.mode} />
            <Detail label="Formato" value={tournament.format === "live" ? "Presencial" : "Online"} />
            <Detail label="Moneda" value={tournament.currency} />
            <Detail label="Posición" value={tournament.finish_position ? String(tournament.finish_position) : "Sin registrar"} />
            <Detail label="Field size" value={tournament.field_size ? String(tournament.field_size) : "Sin registrar"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Desglose financiero</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Detail label="Buy-in" value={formatMoney(tournament.buy_in, tournament.currency)} />
            <Detail label="Reentries" value={String(tournament.reentries)} />
            <Detail label="Costo por reentry" value={formatMoney(tournament.reentry_cost, tournament.currency)} />
            <Detail label="Premio" value={formatMoney(tournament.prize, tournament.currency)} />
            <Detail label="Bounties" value={formatMoney(tournament.bounties, tournament.currency)} />
            <Detail label="Retorno total" value={formatMoney(tournament.total_return, tournament.currency)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {tournament.notes || "No hay notas para este torneo."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialCard({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  const toneClass = tone === "negative"
    ? "text-destructive"
    : tone === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-foreground";

  return (
    <Card>
      <CardContent>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
