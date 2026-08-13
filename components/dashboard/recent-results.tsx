import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentTournament } from "@/lib/recent-tournaments";
import { tournamentPlatforms } from "@/lib/tournaments";

const platformLabels = new Map<string, string>(
  tournamentPlatforms.map(({ label, value }) => [value, label]),
);

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function RecentResults({ tournaments }: { tournaments: RecentTournament[] }) {
  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="flex-row items-center justify-between border-b py-4">
        <CardTitle className="text-base">Resultados recientes</CardTitle>
        <Button variant="ghost" size="sm" render={<Link href="/tournaments" />}>
          Ver todos <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      {tournaments.length === 0 ? (
        <CardContent className="flex min-h-44 flex-col items-center justify-center text-center">
          <Trophy className="mb-3 size-8 text-primary" aria-hidden="true" />
          <p className="font-medium">Todavía no hay resultados</p>
          <p className="mt-1 text-sm text-muted-foreground">Tus últimos torneos aparecerán aquí.</p>
        </CardContent>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Fecha</TableHead>
              <TableHead>Torneo</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead className="text-right">Invertido</TableHead>
              <TableHead className="text-right">Retorno</TableHead>
              <TableHead className="pr-6 text-right">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell className="pl-6 text-muted-foreground">{formatDate(tournament.startsAt)}</TableCell>
                <TableCell className="max-w-64 truncate font-medium">
                  <Link href={`/tournaments/${tournament.id}`} className="hover:text-primary hover:underline">
                    {tournament.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{platformLabels.get(tournament.platform) ?? tournament.platform}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{formatMoney(tournament.invested, tournament.currency)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{formatMoney(tournament.returned, tournament.currency)}</TableCell>
                <TableCell className={`pr-6 text-right font-mono font-semibold tabular-nums ${tournament.profit < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {formatMoney(tournament.profit, tournament.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
