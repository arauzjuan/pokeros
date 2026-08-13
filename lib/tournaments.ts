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
  { value: "mtt", label: "MTT", category: "tournament" },
  { value: "pko", label: "PKO", category: "tournament" },
  { value: "mystery-bounty", label: "Mystery Bounty", category: "tournament" },
  { value: "sit-and-go", label: "Sit & Go", category: "tournament" },
  { value: "cash", label: "Cash", category: "cash" },
] as const;

export type TournamentMode = (typeof tournamentModes)[number]["value"];

export const supportedCurrencies = ["USD", "EUR", "ARS", "BRL", "GBP", "MXN"] as const;
