import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { KpiCard } from '@/components/kpi-card'
import { BankrollChart } from '@/components/dashboard/bankroll-chart'
import { AiInsightCard } from '@/components/dashboard/ai-insight-card'
import { FormatPerformance } from '@/components/dashboard/format-performance'
import { BuyinPerformance } from '@/components/dashboard/buyin-performance'
import { dashboardKpis } from '@/lib/data'
import { getPlayerMetrics } from '@/lib/player-metrics'

export default async function DashboardPage() {
  const metrics = await getPlayerMetrics()
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
    change: 0,
  }))

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {personalizedKpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <BankrollChart />
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
