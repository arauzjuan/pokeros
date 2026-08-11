import Link from 'next/link'
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { aiInsight } from '@/lib/data'

export function AiInsightCard() {
  return (
    <Card className="relative gap-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6">
      <div className="pointer-events-none absolute -top-16 -right-16 size-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </div>
            <span className="text-sm font-semibold">PokerOS AI</span>
          </div>
          <Badge variant="secondary" className="gap-1.5 text-[10px]">
            <span className="size-1.5 rounded-full bg-profit" />
            Insight en vivo
          </Badge>
        </div>

        <p className="text-lg leading-snug font-medium text-balance">{aiInsight.headline}</p>

        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-background/50 p-3.5">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Recomendación
            </span>
            <p className="text-sm leading-relaxed text-pretty">{aiInsight.recommendation}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" render={<Link href="/rendimiento" />}>
            Ver análisis
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
          <Button size="sm" variant="outline" render={<Link href="/ai" />}>
            <Sparkles className="size-4" data-icon="inline-start" />
            Preguntar a PokerOS
          </Button>
        </div>
      </div>
    </Card>
  )
}
