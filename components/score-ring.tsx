import { cn } from '@/lib/utils'

function scoreColor(score: number) {
  if (score >= 85) return 'var(--profit)'
  if (score >= 70) return 'var(--primary)'
  if (score >= 50) return 'var(--warning)'
  return 'var(--loss)'
}

export function ScoreRing({
  score,
  size = 72,
  stroke = 6,
  className,
  showLabel = true,
}: {
  score: number
  size?: number
  stroke?: number
  className?: string
  showLabel?: boolean
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = scoreColor(score)
  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      {showLabel ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-semibold tabular-nums"
            style={{ fontSize: size * 0.28, color }}
          >
            {score}
          </span>
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>
      ) : null}
    </div>
  )
}
