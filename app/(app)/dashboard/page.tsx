import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { KpiCard } from '@/components/kpi-card'
import { BankrollChart } from '@/components/dashboard/bankroll-chart'
import { AiInsightCard } from '@/components/dashboard/ai-insight-card'
import { FormatPerformance } from '@/components/dashboard/format-performance'
import { BuyinPerformance } from '@/components/dashboard/buyin-performance'
import { dashboardKpis } from '@/lib/data'
import { getBankrollHistory, getPlayerMetrics, metricsRanges, type MetricsRange } from '@/lib/player-metrics'

const validRanges = new Set<MetricsRange>(metricsRanges.map(({ value }) => value))

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range: requestedRange } = await searchParams
  const range: MetricsRange = validRanges.has(requestedRange as MetricsRange)
    ? requestedRange as MetricsRange
    : 'all_time'
  const periodLabel = metricsRanges.find(({ value }) => value === range)?.label ?? 'Todo el historial'
  const [metrics, history] = await Promise.all([
    getPlayerMetrics(range),
    getBankrollHistory(range),
  ])
  const metricValues: Record<string, number> = {
    bankroll: metrics.bankroll,
    profit: metrics.profit,
    roi: metrics.roi,
    abi: metrics.abi,
    tournaments: metrics.tournaments,
    itm: metrics.itm,
  }
  const personalizedKpis = dashboardKpis.map((kpi) => ({
    ...kpi,
    value: metricValues[kpi.key],
    change: undefined,
  }))

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader range={range} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {personalizedKpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} periodLabel={kpi.key === 'bankroll' ? 'Saldo actual' : periodLabel} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <BankrollChart data={history.points} currency={history.currency} />
        </div>
        <div>
          <AiInsightCard />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <FormatPerformance />
        </div>
        <div className="lg:col-span-3">
          <BuyinPerformance />
        </div>
      </div>
    </div>
  )
}
