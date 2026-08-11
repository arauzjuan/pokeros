import { PageHeader } from '@/components/page-header'
import { PlannerView } from '@/components/planner/planner-view'

export const metadata = {
  title: 'Tournament Planner',
}

export default function PlannerPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tournament Planner"
        description="Configure your session and let PokerOS AI build a bankroll-optimized schedule."
      />
      <PlannerView />
    </div>
  )
}
