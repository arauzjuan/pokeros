'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Segmented } from '@/components/segmented'

const periods = [
  { label: '7 días', value: '7d' },
  { label: '30 días', value: '30d' },
  { label: '90 días', value: '90d' },
  { label: 'Este año', value: 'year' },
  { label: 'Histórico', value: 'all' },
] as const

export function DashboardHeader() {
  const [period, setPeriod] = useState<string>('90d')
  return (
    <PageHeader title="Buenas tardes, Alex" subtitle="Así está evolucionando tu carrera de póker.">
      <div className="max-w-full overflow-x-auto">
        <Segmented options={periods as never} value={period} onChange={setPeriod} size="sm" />
      </div>
    </PageHeader>
  )
}
