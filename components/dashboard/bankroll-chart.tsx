'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { MetricInfo } from '@/components/metric-info'

type Point = { date: string; label: string; bankroll: number }

const config = {
  bankroll: { label: 'Bankroll', color: 'var(--chart-1)' },
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, currency }: any) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as Point
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{point.date}</p>
      <div className="flex items-center justify-between gap-6">
        <span className="text-muted-foreground">Bankroll</span>
        <span className="font-mono font-semibold text-primary tabular-nums">
          {formatMoney(point.bankroll, currency)}
        </span>
      </div>
    </div>
  )
}

export function BankrollChart({ data, currency }: { data: Point[]; currency: string }) {
  const current = data.at(-1)?.bankroll ?? 0
  const maximum = data.length ? Math.max(...data.map((point) => point.bankroll)) : 0
  const drawdown = maximum > 0 ? ((current - maximum) / maximum) * 100 : 0

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-1.5 text-base">
            Evolución del Bankroll <MetricInfo metric="bankroll" />
          </CardTitle>
          <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1">
            <Stat label="Bankroll actual" value={formatMoney(current, currency)} tone="primary" />
            <Stat label="Máximo del período" value={formatMoney(maximum, currency)} />
            <Stat label="Drawdown actual" value={`${drawdown.toFixed(1).replace('.', ',')}%`} tone={drawdown < 0 ? 'loss' : undefined} tip="drawdown" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No hay movimientos para mostrar.
          </div>
        ) : (
          <ChartContainer config={config} className="h-[300px] w-full">
            <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="fillBankroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-bankroll)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-bankroll)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={40} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tickLine={false} axisLine={false} width={58} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(value) => `${Math.round(value / 1000)}K`} />
              <ChartTooltip content={<CustomTooltip currency={currency} />} />
              <Area type="monotone" dataKey="bankroll" stroke="var(--color-bankroll)" strokeWidth={2} fill="url(#fillBankroll)" />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, tone, tip }: { label: string; value: string; tone?: 'primary' | 'loss'; tip?: string }) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {label}{tip ? <MetricInfo metric={tip} /> : null}
      </span>
      <span className={`font-mono text-sm font-semibold tabular-nums ${tone === 'primary' ? 'text-primary' : tone === 'loss' ? 'text-loss' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  )
}
