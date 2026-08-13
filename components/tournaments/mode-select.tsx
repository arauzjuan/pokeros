"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { tournamentModes, type TournamentMode } from "@/lib/tournaments";

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function ModeSelect({ defaultValue = "" }: { defaultValue?: TournamentMode | "" }) {
  const [mode, setMode] = useState<TournamentMode | "">(defaultValue);
  const selectedMode = tournamentModes.find((option) => option.value === mode);

  return (
    <div className="space-y-2">
      <Label htmlFor="mode">Modalidad <span aria-hidden="true">*</span></Label>
      <select
        id="mode"
        name="mode"
        className={selectClassName}
        value={mode}
        onChange={(event) => setMode(event.target.value as TournamentMode)}
        required
      >
        <option value="" disabled>Seleccioná una modalidad</option>
        {tournamentModes.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {selectedMode?.category === "cash" && (
        <p className="text-xs text-muted-foreground" role="note">
          Cash está disponible como modalidad, pero Core v0.1 prioriza métricas de torneos.
        </p>
      )}
    </div>
  );
}
