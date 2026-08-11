export function usd(value: number, opts?: { sign?: boolean; decimals?: number }) {
  const decimals = opts?.decimals ?? 0
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  const sign = value < 0 ? '-' : opts?.sign ? '+' : ''
  return `${sign}USD ${formatted}`
}

export function pct(value: number, opts?: { sign?: boolean; decimals?: number }) {
  const decimals = opts?.decimals ?? 1
  const sign = value > 0 && opts?.sign ? '+' : ''
  return `${sign}${value.toFixed(decimals).replace('.', ',')}%`
}

export function num(value: number) {
  return value.toLocaleString('en-US')
}

export function trendColor(value: number) {
  if (value > 0) return 'text-profit'
  if (value < 0) return 'text-loss'
  return 'text-muted-foreground'
}
