"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tournamentPlatforms, type TournamentPlatform } from "@/lib/tournaments";

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function PlatformSelect({ defaultValue = "" }: { defaultValue?: TournamentPlatform | "" }) {
  const [platform, setPlatform] = useState<TournamentPlatform | "">(defaultValue);

  return (
    <div className="space-y-2">
      <Label htmlFor="platform">Plataforma <span aria-hidden="true">*</span></Label>
      <select
        id="platform"
        name="platform"
        className={selectClassName}
        value={platform}
        onChange={(event) => setPlatform(event.target.value as TournamentPlatform)}
        required
      >
        <option value="" disabled>Seleccioná una plataforma</option>
        {tournamentPlatforms.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      {platform === "other" && (
        <div className="space-y-2 pt-2">
          <Label htmlFor="customPlatform">Nombre de la plataforma</Label>
          <Input
            id="customPlatform"
            name="customPlatform"
            placeholder="Ingresá la plataforma"
            minLength={2}
            maxLength={80}
            required
          />
        </div>
      )}
    </div>
  );
}
