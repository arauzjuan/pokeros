"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supportedCurrencies, tournamentModes, tournamentPlatforms } from "@/lib/tournaments";

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function TournamentForm({ defaultCurrency }: { defaultCurrency: string }) {
  const [prepared, setPrepared] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPrepared(true);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate={false}>
      {prepared && (
        <Alert role="status">
          <AlertDescription>
            Los datos son válidos. El guardado se conectará al backend en el siguiente paso.
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
          <div className="space-y-2">
            <Label htmlFor="platform">Plataforma <span aria-hidden="true">*</span></Label>
            <select id="platform" name="platform" className={selectClassName} defaultValue="" required>
              <option value="" disabled>Seleccioná una plataforma</option>
              {tournamentPlatforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mode">Modalidad <span aria-hidden="true">*</span></Label>
            <select id="mode" name="mode" className={selectClassName} defaultValue="" required>
              <option value="" disabled>Seleccioná una modalidad</option>
              {tournamentModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
            </select>
          </div>
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
            <Input id="buyIn" name="buyIn" type="number" inputMode="decimal" min="0" step="0.01" placeholder="100.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reentries">Reentries</Label>
            <Input id="reentries" name="reentries" type="number" inputMode="numeric" min="0" step="1" defaultValue="0" />
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
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground"><span aria-hidden="true">*</span> Campo obligatorio</p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" render={<Link href="/tournaments" />}>Cancelar</Button>
        <Button type="submit">Guardar resultado</Button>
      </div>
    </form>
  );
}
