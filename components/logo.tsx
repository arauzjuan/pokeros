import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="font-mono text-sm font-bold">P</span>
        <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-profit ring-2 ring-sidebar" />
      </div>
      <span className="text-base font-semibold tracking-tight">
        Poker<span className="text-primary">OS</span>
      </span>
    </div>
  )
}
