'use client'

import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { MetricInfo } from '@/components/metric-info'
import { formatPerformance } from '@/lib/data'
import { usd, pct } from '@/lib/format'
import { cn } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium">{p.format}</p>
      <p className={cn('font-mono tabular-nums', p.profit >= 0 ? 'text-profit' : 'text-loss')}>
        {usd(p.profit, { sign: true })} · ROI {pct(p.roi, { sign: true })}
      </p>
    </div>
  )
}

export function FormatPerformance() {
  return (
    <Card className="h-full">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-1.5 text-base">
          Rendimiento por formato <MetricInfo metric="roi" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-6">
        <ChartContainer config={{ profit: { label: 'Profit' } }} className="h-[160px] w-full">
          <BarChart
            data={formatPerformance}
            layout="vertical"
            margin={{ left: 0, right: 12, top: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="format"
              tickLine={false}
              axisLine={false}
              width={110}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <ChartTooltip cursor={{ fill: 'var(--muted)', opacity: 0.3 }} content={<TooltipContent />} />
            <Bar dataKey="profit" radius={4} barSize={16}>
              {formatPerformance.map((d) => (
                <Cell key={d.format} fill={d.profit >= 0 ? 'var(--profit)' : 'var(--loss)'} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="flex flex-col gap-1">
          {formatPerformance.map((d) => (
            <div
              key={d.format}
              className="flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/40"
            >
              <span className="font-medium">{d.format}</span>
              <div className="flex items-center gap-4 font-mono tabular-nums">
                <span className={cn(d.profit >= 0 ? 'text-profit' : 'text-loss')}>
                  {usd(d.profit, { sign: true })}
                </span>
                <span
                  className={cn(
                    'w-16 text-right',
                    d.roi >= 0 ? 'text-profit' : 'text-loss',
                  )}
                >
                  {pct(d.roi, { sign: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
