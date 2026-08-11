import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  BAJO: 'bg-profit/15 text-profit',
  MEDIO: 'bg-warning/15 text-warning',
  ALTO: 'bg-loss/15 text-loss',
}

export function RiskBadge({
  level,
  className,
}: {
  level: 'BAJO' | 'MEDIO' | 'ALTO'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-xs font-semibold',
        styles[level],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      Riesgo {level}
    </span>
  )
}
