"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";

import { deleteTournament } from "@/app/(app)/tournaments/[id]/actions";
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

export function DeleteTournamentDialog({ tournamentId, tournamentName }: { tournamentId: string; tournamentName: string }) {
  const action = deleteTournament.bind(null, tournamentId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>
        <Trash2 className="size-4" /> Eliminar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar resultado</DialogTitle>
          <DialogDescription>
            Vas a eliminar “{tournamentName}” y todos sus movimientos de bankroll. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        {state.error && (
          <Alert variant="destructive" role="alert"><AlertDescription>{state.error}</AlertDescription></Alert>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={pending} />}>Cancelar</DialogClose>
          <form action={formAction}>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Eliminando…" : "Sí, eliminar resultado"}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
