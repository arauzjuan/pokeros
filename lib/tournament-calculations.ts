export type InvestmentInput = {
  buyIn: number;
  reentries: number;
  reentryCost: number;
};

export function calculateTotalInvested({ buyIn, reentries, reentryCost }: InvestmentInput) {
  if (![buyIn, reentries, reentryCost].every(Number.isFinite)) {
    throw new Error("Los valores de inversión deben ser números válidos.");
  }

  if (buyIn < 0 || reentries < 0 || reentryCost < 0 || !Number.isInteger(reentries)) {
    throw new Error("La inversión no acepta valores negativos ni reentries decimales.");
  }

  return Math.round((buyIn + reentries * reentryCost) * 100) / 100;
}
