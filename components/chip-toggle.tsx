'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChipToggle({
  label,
  active,
  onToggle,
}: {
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary/40 bg-primary/15 text-foreground'
          : 'border-border bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground',
      )}
    >
      {active ? <Check className="size-3.5 text-primary" /> : null}
      {label}
    </button>
  )
}
