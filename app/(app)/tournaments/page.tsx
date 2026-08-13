import Link from "next/link";
import { Plus, Trophy } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { tournamentPlatforms } from "@/lib/tournaments";

type TournamentRow = {
  id: string;
  starts_at: string;
  name: string;
  platform: string;
  total_invested: number | string;
  prize: number | string;
  net_profit: number | string;
  currency: string;
};

const platformLabels = new Map(tournamentPlatforms.map(({ label, value }) => [value, label]));

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
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const { created } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("id, starts_at, name, platform, total_invested, prize, net_profit, currency")
    .order("starts_at", { ascending: false })
    .order("created_at", { ascending: false });
  const tournaments = (data ?? []) as TournamentRow[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Torneos" subtitle="Registrá y consultá todos tus resultados.">
        <Button render={<Link href="/tournaments/new" />}>
          <Plus className="size-4" />
          Registrar torneo
        </Button>
      </PageHeader>
      {created === "1" && (
        <Alert role="status">
          <AlertDescription>El resultado se guardó y el bankroll se actualizó correctamente.</AlertDescription>
        </Alert>
      )}
      {error ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>No pudimos cargar tu historial. Intentá nuevamente.</AlertDescription>
        </Alert>
      ) : tournaments.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <Trophy className="mb-4 size-10 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Todavía no hay torneos registrados</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Tu historial aparecerá aquí cuando cargues tu primer resultado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Fecha</TableHead>
                <TableHead>Torneo</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead className="text-right">Buy-in total</TableHead>
                <TableHead className="text-right">Premio</TableHead>
                <TableHead className="pr-6 text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.map((tournament) => {
                const profit = Number(tournament.net_profit);

                return (
                  <TableRow key={tournament.id}>
                    <TableCell className="pl-6 text-muted-foreground">{formatDate(tournament.starts_at)}</TableCell>
                    <TableCell className="max-w-64 truncate font-medium">
                      <Link className="hover:text-primary hover:underline" href={`/tournaments/${tournament.id}`}>
                        {tournament.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{platformLabels.get(tournament.platform) ?? tournament.platform}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatMoney(tournament.total_invested, tournament.currency)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatMoney(tournament.prize, tournament.currency)}</TableCell>
                    <TableCell className={`pr-6 text-right font-mono font-semibold tabular-nums ${profit < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {formatMoney(profit, tournament.currency)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
