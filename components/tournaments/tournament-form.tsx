"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlatformSelect } from "@/components/tournaments/platform-select";
import { ModeSelect } from "@/components/tournaments/mode-select";
import { supportedCurrencies } from "@/lib/tournaments";
import { calculateTournamentFinancials } from "@/lib/tournament-calculations";
import { prepareTournament } from "@/app/(app)/tournaments/new/actions";
import { updateTournament } from "@/app/(app)/tournaments/[id]/edit/actions";

export type TournamentFormValues = {
  id: string;
  playedAt: string;
  name: string;
  platform: "ggpoker" | "pokerstars" | "wpt-global" | "acr" | "888poker" | "live" | "other";
  mode: "mtt" | "pko" | "mystery-bounty" | "sit-and-go" | "cash";
  currency: string;
  buyIn: number;
  reentries: number;
  reentryCost: number;
  prize: number;
  bounties: number;
  position: number | null;
  fieldSize: number | null;
  notes: string;
};

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function TournamentForm({ defaultCurrency, initialValues }: { defaultCurrency: string; initialValues?: TournamentFormValues }) {
  const action = initialValues ? updateTournament.bind(null, initialValues.id) : prepareTournament;
  const [state, formAction, pending] = useActionState(action, {});
  const [currency, setCurrency] = useState(initialValues?.currency ?? defaultCurrency);
  const [buyIn, setBuyIn] = useState(initialValues?.buyIn ?? 0);
  const [reentries, setReentries] = useState(initialValues?.reentries ?? 0);
  const [reentryCost, setReentryCost] = useState(initialValues?.reentryCost ?? 0);
  const [prize, setPrize] = useState(initialValues?.prize ?? 0);
  const [bounties, setBounties] = useState(initialValues?.bounties ?? 0);
  const financials = useMemo(() => {
    try {
      return calculateTournamentFinancials({ buyIn, reentries, reentryCost, prize, bounties });
    } catch {
      return null;
    }
  }, [buyIn, reentries, reentryCost, prize, bounties]);

  return (
    <form className="space-y-6" action={formAction}>
      {state.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Información del torneo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="playedAt">Fecha <span aria-hidden="true">*</span></Label>
            <Input id="playedAt" name="playedAt" type="date" defaultValue={initialValues?.playedAt ?? today()} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre <span aria-hidden="true">*</span></Label>
            <Input id="name" name="name" placeholder="Sunday Million" defaultValue={initialValues?.name} minLength={2} maxLength={120} required />
          </div>
          <PlatformSelect defaultValue={initialValues?.platform} />
          <ModeSelect defaultValue={initialValues?.mode} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado financiero</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="currency">Moneda <span aria-hidden="true">*</span></Label>
            <select id="currency" name="currency" className={selectClassName} value={currency} onChange={(event) => setCurrency(event.target.value)} required>
              {supportedCurrencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyIn">Buy-in <span aria-hidden="true">*</span></Label>
            <Input id="buyIn" name="buyIn" type="number" inputMode="decimal" min="0" step="0.01" placeholder="100.00" defaultValue={initialValues?.buyIn} onChange={(event) => setBuyIn(Number(event.target.value) || 0)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reentries">Reentries</Label>
            <Input id="reentries" name="reentries" type="number" inputMode="numeric" min="0" step="1" defaultValue={initialValues?.reentries ?? 0} onChange={(event) => setReentries(Number(event.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reentryCost">Costo por reentry</Label>
            <Input id="reentryCost" name="reentryCost" type="number" inputMode="decimal" min="0" step="0.01" defaultValue={initialValues?.reentryCost ?? 0} onChange={(event) => setReentryCost(Number(event.target.value) || 0)} required={reentries > 0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prize">Premio</Label>
            <Input id="prize" name="prize" type="number" inputMode="decimal" min="0" step="0.01" defaultValue={initialValues?.prize ?? 0} onChange={(event) => setPrize(Number(event.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bounties">Bounties</Label>
            <Input id="bounties" name="bounties" type="number" inputMode="decimal" min="0" step="0.01" defaultValue={initialValues?.bounties ?? 0} onChange={(event) => setBounties(Number(event.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Posición</Label>
            <Input id="position" name="position" type="number" inputMode="numeric" min="1" step="1" placeholder="1" defaultValue={initialValues?.position ?? undefined} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fieldSize">Field size</Label>
            <Input id="fieldSize" name="fieldSize" type="number" inputMode="numeric" min="1" step="1" placeholder="2500" defaultValue={initialValues?.fieldSize ?? undefined} />
          </div>
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" maxLength={1000} rows={4} placeholder="Mesa final, manos importantes, decisiones para revisar…" defaultValue={initialValues?.notes} />
          </div>
          <div className="grid gap-3 md:col-span-2 md:grid-cols-3 lg:col-span-3" aria-live="polite">
            <FinancialSummary label="Inversión total" currency={currency} value={financials?.totalInvested} />
            <FinancialSummary label="Retorno total" currency={currency} value={financials?.totalReturn} />
            <FinancialSummary label="Profit neto" currency={currency} value={financials?.netProfit} emphasize />
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground"><span aria-hidden="true">*</span> Campo obligatorio</p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" render={<Link href={initialValues ? `/tournaments/${initialValues.id}` : "/tournaments"} />}>Cancelar</Button>
        <Button type="submit" disabled={pending}>{pending ? "Guardando…" : initialValues ? "Guardar cambios" : "Guardar resultado"}</Button>
      </div>
    </form>
  );
}

function FinancialSummary({
  label,
  currency,
  value,
  emphasize = false,
}: {
  label: string;
  currency: string;
  value?: number;
  emphasize?: boolean;
}) {
  const profitClassName = value === undefined
    ? "text-foreground"
    : value < 0
      ? "text-destructive"
      : emphasize
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-foreground";

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${profitClassName}`}>
        {currency} {value?.toFixed(2) ?? "--"}
      </p>
    </div>
  );
}
