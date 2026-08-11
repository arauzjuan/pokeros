import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { metricTooltips } from '@/lib/data'

export function MetricInfo({ metric }: { metric: string }) {
  const text = metricTooltips[metric]
  if (!text) return null
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={`Qué significa ${metric.toUpperCase()}`}
            className="inline-flex items-center text-muted-foreground/70 transition-colors hover:text-foreground"
          />
        }
      >
        <Info className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-56 leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  )
}
