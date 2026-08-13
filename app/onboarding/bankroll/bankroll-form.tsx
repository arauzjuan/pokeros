"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { saveInitialBankroll } from "@/app/onboarding/bankroll/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

export function BankrollForm({ defaultCurrency }: { defaultCurrency: string }) {
  const [state, formAction, isPending] = useActionState(saveInitialBankroll, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="bankroll">Bankroll actual</Label>
        <Input
          id="bankroll"
          name="bankroll"
          type="number"
          inputMode="decimal"
          min="0"
          max="999999999999.99"
          step="0.01"
          placeholder="1000.00"
          disabled={isPending}
          required
        />
        <p className="text-xs text-muted-foreground">
          Ingresá únicamente el capital destinado a jugar al póker.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Moneda</Label>
        <select
          id="currency"
          name="currency"
          className={selectClassName}
          defaultValue={defaultCurrency}
          disabled={isPending}
          required
        >
          <option value="USD">USD — Dólar estadounidense</option>
          <option value="EUR">EUR — Euro</option>
          <option value="ARS">ARS — Peso argentino</option>
          <option value="BRL">BRL — Real brasileño</option>
          <option value="GBP">GBP — Libra esterlina</option>
          <option value="MXN">MXN — Peso mexicano</option>
        </select>
      </div>

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {isPending ? "Creando bankroll…" : "Finalizar configuración"}
      </Button>
    </form>
  );
}
