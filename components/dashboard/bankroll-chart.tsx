'use client'

import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { Segmented } from '@/components/segmented'
import { MetricInfo } from '@/components/metric-info'
import { bankrollSeries, bankrollStats } from '@/lib/data'
import { usd, num } from '@/lib/format'

const roomFilters = [
  { label: 'Todas', value: 'all' },
  { label: 'GGPoker', value: 'gg' },
  { label: 'PokerStars', value: 'ps' },
  { label: 'WPT Global', value: 'wpt' },
  { label: 'Live', value: 'live' },
] as const

const config = {
  bankroll: { label: 'Bankroll', color: 'var(--chart-1)' },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-medium text-foreground">{p.date}</p>
      <div className="flex flex-col gap-1">
        <Row label="Bankroll" value={usd(p.bankroll)} accent />
        <Row label="Profit acumulado" value={usd(p.profit, { sign: true })} />
        <Row label="Torneos jugados" value={num(p.tournaments)} />
      </div>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono tabular-nums ${accent ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  )
}

export function BankrollChart() {
  const [room, setRoom] = useState<string>('all')
  // El filtro de sala es ilustrativo en el prototipo; escala la serie levemente.
  const factor = room === 'all' ? 1 : room === 'gg' ? 0.46 : room === 'ps' ? 0.26 : room === 'wpt' ? 0.12 : 0.16
  const data = bankrollSeries.map((d) => ({
    ...d,
    bankroll: Math.round(d.bankroll * factor),
    profit: Math.round(d.profit * factor),
  }))

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-1.5 text-base">
              Evolución del Bankroll <MetricInfo metric="bankroll" />
            </CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1">
              <Stat label="Bankroll actual" value={usd(bankrollStats.current)} tone="primary" />
              <Stat label="Máximo histórico" value={usd(bankrollStats.allTimeHigh)} />
              <Stat label="Drawdown actual" value={`${bankrollStats.drawdown}%`} tone="loss" tip="drawdown" />
            </div>
          </div>
          <Segmented options={roomFilters as never} value={room} onChange={setRoom} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={config} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="fillBankroll" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-bankroll)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-bankroll)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={40}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="bankroll"
              stroke="var(--color-bankroll)"
              strokeWidth={2}
              fill="url(#fillBankroll)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function Stat({
  label,
  value,
  tone,
  tip,
}: {
  label: string
  value: string
  tone?: 'primary' | 'loss'
  tip?: string
}) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {label}
        {tip ? <MetricInfo metric={tip} /> : null}
      </span>
      <span
        className={`font-mono text-sm font-semibold tabular-nums ${
          tone === 'primary' ? 'text-primary' : tone === 'loss' ? 'text-loss' : 'text-foreground'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
