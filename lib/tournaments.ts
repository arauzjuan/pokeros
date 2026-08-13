export const tournamentPlatforms = [
  { value: "ggpoker", label: "GGPoker", kind: "online" },
  { value: "pokerstars", label: "PokerStars", kind: "online" },
  { value: "wpt-global", label: "WPT Global", kind: "online" },
  { value: "acr", label: "ACR", kind: "online" },
  { value: "888poker", label: "888poker", kind: "online" },
  { value: "live", label: "Live", kind: "live" },
  { value: "other", label: "Other", kind: "custom" },
] as const;

export type TournamentPlatform = (typeof tournamentPlatforms)[number]["value"];

export const tournamentModes = [
  "MTT",
  "PKO",
  "Mystery Bounty",
  "Sit & Go",
  "Cash",
] as const;

export const supportedCurrencies = ["USD", "EUR", "ARS", "BRL", "GBP", "MXN"] as const;
