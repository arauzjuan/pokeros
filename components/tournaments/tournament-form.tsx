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
import { calculateTotalInvested } from "@/lib/tournament-calculations";
import { prepareTournament } from "@/app/(app)/tournaments/new/actions";

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function TournamentForm({ defaultCurrency }: { defaultCurrency: string }) {
  const [state, formAction, pending] = useActionState(prepareTournament, {});
  const [buyIn, setBuyIn] = useState(0);
  const [reentries, setReentries] = useState(0);
  const [reentryCost, setReentryCost] = useState(0);
  const totalInvested = useMemo(() => {
    try {
      return calculateTotalInvested({ buyIn, reentries, reentryCost });
    } catch {
      return null;
    }
  }, [buyIn, reentries, reentryCost]);

  return (
    <form className="space-y-6" action={formAction}>
      {state.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state.totalInvested !== undefined && (
        <Alert role="status">
          <AlertDescription>
            Inversión verificada por el servidor: {defaultCurrency} {state.totalInvested.toFixed(2)}.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del torneo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="playedAt">Fecha <span aria-hidden="true">*</span></Label>
            <Input id="playedAt" name="playedAt" type="date" defaultValue={today()} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre <span aria-hidden="true">*</span></Label>
            <Input id="name" name="name" placeholder="Sunday Million" minLength={2} maxLength={120} required />
          </div>
          <PlatformSelect />
          <ModeSelect />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado financiero</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="currency">Moneda <span aria-hidden="true">*</span></Label>
            <select id="currency" name="currency" className={selectClassName} defaultValue={defaultCurrency} required>
              {supportedCurrencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyIn">Buy-in <span aria-hidden="true">*</span></Label>
            <Input id="buyIn" name="buyIn" type="number" inputMode="decimal" min="0" step="0.01" placeholder="100.00" onChange={(event) => setBuyIn(Number(event.target.value) || 0)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reentries">Reentries</Label>
            <Input id="reentries" name="reentries" type="number" inputMode="numeric" min="0" step="1" defaultValue="0" onChange={(event) => setReentries(Number(event.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reentryCost">Costo por reentry</Label>
            <Input id="reentryCost" name="reentryCost" type="number" inputMode="decimal" min="0" step="0.01" defaultValue="0" onChange={(event) => setReentryCost(Number(event.target.value) || 0)} required={reentries > 0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prize">Premio</Label>
            <Input id="prize" name="prize" type="number" inputMode="decimal" min="0" step="0.01" defaultValue="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bounties">Bounties</Label>
            <Input id="bounties" name="bounties" type="number" inputMode="decimal" min="0" step="0.01" defaultValue="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Posición</Label>
            <Input id="position" name="position" type="number" inputMode="numeric" min="1" step="1" placeholder="1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fieldSize">Field size</Label>
            <Input id="fieldSize" name="fieldSize" type="number" inputMode="numeric" min="1" step="1" placeholder="2500" />
          </div>
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" maxLength={1000} rows={4} placeholder="Mesa final, manos importantes, decisiones para revisar…" />
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 md:col-span-2 lg:col-span-3" aria-live="polite">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inversión total</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
              {defaultCurrency} {totalInvested?.toFixed(2) ?? "--"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Buy-in + (reentries × costo por reentry)</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground"><span aria-hidden="true">*</span> Campo obligatorio</p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" render={<Link href="/tournaments" />}>Cancelar</Button>
        <Button type="submit" disabled={pending}>{pending ? "Verificando…" : "Guardar resultado"}</Button>
      </div>
    </form>
  );
}
