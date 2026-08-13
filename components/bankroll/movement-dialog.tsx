"use client";

import { useActionState } from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

import { createBankrollMovement } from "@/app/(app)/bankroll/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function MovementDialog({ type, today }: { type: "deposit" | "withdrawal"; today: string }) {
  const [state, formAction, pending] = useActionState(createBankrollMovement, {});
  const deposit = type === "deposit";
  const Icon = deposit ? ArrowDownToLine : ArrowUpFromLine;
  const title = deposit ? "Agregar fondos" : "Retirar fondos";

  return (
    <Dialog>
      <DialogTrigger render={<Button variant={deposit ? "default" : "outline"} />}>
        <Icon className="size-4" /> {title}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {deposit
              ? "Registrá fondos externos que ingresan a tu bankroll."
              : "Registrá fondos que salen de tu bankroll."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="type" value={type} />
          <div className="grid gap-2">
            <Label htmlFor={`${type}-amount`}>Importe</Label>
            <Input id={`${type}-amount`} name="amount" type="number" min="0.01" max="999999999999.99" step="0.01" inputMode="decimal" required autoFocus />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${type}-date`}>Fecha</Label>
            <Input id={`${type}-date`} name="occurredAt" type="date" defaultValue={today} max={today} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${type}-notes`}>Notas <span className="font-normal text-muted-foreground">(opcional)</span></Label>
            <Textarea id={`${type}-notes`} name="notes" maxLength={500} placeholder="Origen, motivo o referencia" />
          </div>
          {state.error ? (
            <Alert variant="destructive" role="alert"><AlertDescription>{state.error}</AlertDescription></Alert>
          ) : null}
          <DialogFooter className="mt-1">
            <DialogClose render={<Button type="button" variant="outline" disabled={pending} />}>Cancelar</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : deposit ? "Agregar fondos" : "Confirmar retiro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
