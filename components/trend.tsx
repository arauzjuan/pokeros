import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { pct } from '@/lib/format'

export function Trend({
  value,
  suffix = 'vs. período anterior',
  className,
}: {
  value: number
  suffix?: string
  className?: string
}) {
  const positive = value >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium tabular-nums',
        positive ? 'text-profit' : 'text-loss',
        className,
      )}
    >
      {positive ? (
        <ArrowUpRight className="size-3.5" />
      ) : (
        <ArrowDownRight className="size-3.5" />
      )}
      {pct(value, { sign: true })}
      {suffix ? <span className="text-muted-foreground">{suffix}</span> : null}
    </span>
  )
}
