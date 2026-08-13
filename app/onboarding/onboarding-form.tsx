"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { saveOnboarding } from "@/app/onboarding/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(saveOnboarding, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="displayName">Nombre</Label>
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          placeholder="Tu nombre"
          minLength={2}
          maxLength={80}
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">País</Label>
        <Input
          id="country"
          name="country"
          autoComplete="country-name"
          placeholder="Argentina"
          minLength={2}
          maxLength={80}
          disabled={isPending}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="defaultCurrency">Moneda principal</Label>
          <select
            id="defaultCurrency"
            name="defaultCurrency"
            className={selectClassName}
            defaultValue="USD"
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

        <div className="space-y-2">
          <Label htmlFor="primaryGameType">Tipo principal</Label>
          <select
            id="primaryGameType"
            name="primaryGameType"
            className={selectClassName}
            defaultValue=""
            disabled={isPending}
            required
          >
            <option value="" disabled>Seleccioná una opción</option>
            <option value="mtt">MTT</option>
            <option value="cash">Cash</option>
            <option value="mixed">Mixto</option>
          </select>
        </div>
      </div>

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {isPending ? "Guardando…" : "Completar perfil"}
      </Button>
    </form>
  );
}
