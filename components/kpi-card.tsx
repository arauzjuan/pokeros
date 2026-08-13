import { Card } from '@/components/ui/card'
import { MetricInfo } from '@/components/metric-info'
import { usd, pct, num } from '@/lib/format'

type Kpi = {
  label: string
  value: number
  unit: 'usd' | 'usd-dec' | 'pct' | 'num'
  sign?: boolean
  change?: number
  tip?: string
}

function formatValue(k: Kpi) {
  switch (k.unit) {
    case 'usd':
      return usd(k.value, { sign: k.sign })
    case 'usd-dec':
      return usd(k.value, { sign: k.sign, decimals: 2 })
    case 'pct':
      return pct(k.value, { sign: k.sign })
    case 'num':
      return num(k.value)
  }
}

export function KpiCard({ kpi, periodLabel }: { kpi: Kpi; periodLabel: string }) {
  return (
    <Card className="gap-0 p-5">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {kpi.label}
        </span>
        {kpi.tip ? <MetricInfo metric={kpi.tip} /> : null}
      </div>
      <div className="mt-3 font-mono text-3xl font-semibold tracking-tight tabular-nums text-balance">
        {formatValue(kpi)}
      </div>
      <div className="mt-3">
        <span className="text-xs text-muted-foreground">{periodLabel}</span>
      </div>
    </Card>
  )
}
