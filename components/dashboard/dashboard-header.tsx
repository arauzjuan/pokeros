'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { Segmented } from '@/components/segmented'
import type { MetricsRange } from '@/lib/player-metrics'

const periods = [
  { label: '7 días', value: '7_days' },
  { label: '30 días', value: '30_days' },
  { label: 'Este mes', value: 'this_month' },
  { label: 'Este año', value: 'this_year' },
  { label: 'Histórico', value: 'all_time' },
] as const

export function DashboardHeader({ range }: { range: MetricsRange }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function setRange(value: string) {
    startTransition(() => router.replace(`/dashboard?range=${value}`, { scroll: false }))
  }

  return (
    <PageHeader title="Dashboard" subtitle="Así está evolucionando tu carrera de póker.">
      <div className={`max-w-full overflow-x-auto transition-opacity ${pending ? 'opacity-60' : ''}`}>
        <Segmented options={periods as never} value={range} onChange={setRange} size="sm" />
      </div>
    </PageHeader>
  )
}
