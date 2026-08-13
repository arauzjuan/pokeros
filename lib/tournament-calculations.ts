export type InvestmentInput = {
  buyIn: number;
  reentries: number;
  reentryCost: number;
};

export type TournamentFinancialInput = InvestmentInput & {
  prize: number;
  bounties: number;
};

export type TournamentFinancials = {
  totalInvested: number;
  totalReturn: number;
  netProfit: number;
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateTotalInvested({ buyIn, reentries, reentryCost }: InvestmentInput) {
  if (![buyIn, reentries, reentryCost].every(Number.isFinite)) {
    throw new Error("Los valores de inversión deben ser números válidos.");
  }

  if (buyIn < 0 || reentries < 0 || reentryCost < 0 || !Number.isInteger(reentries)) {
    throw new Error("La inversión no acepta valores negativos ni reentries decimales.");
  }

  return roundCurrency(buyIn + reentries * reentryCost);
}

export function calculateTournamentFinancials({
  buyIn,
  reentries,
  reentryCost,
  prize,
  bounties,
}: TournamentFinancialInput): TournamentFinancials {
  if (![prize, bounties].every(Number.isFinite)) {
    throw new Error("Los valores de retorno deben ser números válidos.");
  }

  if (prize < 0 || bounties < 0) {
    throw new Error("Los premios y bounties no aceptan valores negativos.");
  }

  const totalInvested = calculateTotalInvested({ buyIn, reentries, reentryCost });
  const totalReturn = roundCurrency(prize + bounties);

  return {
    totalInvested,
    totalReturn,
    netProfit: roundCurrency(totalReturn - totalInvested),
  };
}
