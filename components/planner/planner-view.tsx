'use client'

import { useState } from 'react'
import {
  Sparkles,
  Clock,
  Layers,
  Wallet,
  Target,
  Loader2,
  HelpCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ChipToggle } from '@/components/chip-toggle'
import { ScoreRing } from '@/components/score-ring'
import { RiskBadge } from '@/components/risk-badge'
import { MetricInfo } from '@/components/metric-info'
import { Skeleton } from '@/components/ui/skeleton'
import { plannerResult, plannerTimeline } from '@/lib/data'
import { usd } from '@/lib/format'

const allFormats = ['Mystery Bounty', 'PKO', 'Freezeout', 'Regular', 'Satélite']
const allRooms = ['GGPoker', 'PokerStars', 'WPT Global', 'Live']

export function PlannerView() {
  const [bankroll, setBankroll] = useState('16900')
  const [exposure, setExposure] = useState([3])
  const [abi, setAbi] = useState([25])
  const [startTime, setStartTime] = useState('17:00')
  const [endTime, setEndTime] = useState('00:30')
  const [maxTables, setMaxTables] = useState([6])
  const [formats, setFormats] = useState<string[]>(['Mystery Bounty', 'PKO', 'Regular'])
  const [selectedRooms, setSelectedRooms] = useState<string[]>(['GGPoker', 'PokerStars'])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const generate = () => {
    setStatus('loading')
    setTimeout(() => setStatus('done'), 1100)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Config */}
      <Card className="lg:col-span-2">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Construye tu sesión óptima</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-6">
          <Labeled label="Bankroll disponible">
            <Input
              value={bankroll}
              onChange={(e) => setBankroll(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              className="font-mono"
            />
          </Labeled>

          <SliderField
            label="Exposición máxima del bankroll"
            value={exposure}
            onChange={setExposure}
            min={1}
            max={15}
            suffix="%"
            tip="exposure"
          />

          <SliderField
            label="ABI objetivo"
            value={abi}
            onChange={setAbi}
            min={5}
            max={109}
            suffix=" USD"
            tip="abi"
          />

          <div className="grid grid-cols-2 gap-4">
            <Labeled label="Hora de inicio">
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="font-mono" />
            </Labeled>
            <Labeled label="Hora de fin">
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="font-mono" />
            </Labeled>
          </div>

          <SliderField
            label="Máximo de mesas simultáneas"
            value={maxTables}
            onChange={setMaxTables}
            min={1}
            max={16}
            suffix=" mesas"
          />

          <Labeled label="Formatos favoritos">
            <div className="flex flex-wrap gap-2">
              {allFormats.map((f) => (
                <ChipToggle
                  key={f}
                  label={f}
                  active={formats.includes(f)}
                  onToggle={() => toggle(formats, setFormats, f)}
                />
              ))}
            </div>
          </Labeled>

          <Labeled label="Salas">
            <div className="flex flex-wrap gap-2">
              {allRooms.map((r) => (
                <ChipToggle
                  key={r}
                  label={r}
                  active={selectedRooms.includes(r)}
                  onToggle={() => toggle(selectedRooms, setSelectedRooms, r)}
                />
              ))}
            </div>
          </Labeled>

          <Button size="lg" className="mt-1 w-full gap-2" onClick={generate} disabled={status === 'loading'}>
            {status === 'loading' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {status === 'loading' ? 'Generando sesión...' : 'Generar mi sesión'}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      <div className="lg:col-span-3">
        {status === 'idle' ? <EmptyState /> : null}
        {status === 'loading' ? <LoadingState /> : null}
        {status === 'done' ? <ResultState /> : null}
      </div>
    </div>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
  tip,
}: {
  label: string
  value: number[]
  onChange: (v: number[]) => void
  min: number
  max: number
  suffix: string
  tip?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          {label}
          {tip ? <MetricInfo metric={tip} /> : null}
        </label>
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {value[0]}
          {suffix}
        </span>
      </div>
      <Slider value={value} onValueChange={(v) => onChange(v as number[])} min={min} max={max} step={1} />
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="flex h-full min-h-96 items-center justify-center border-dashed">
      <CardContent className="flex max-w-xs flex-col items-center gap-3 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CalendarSpark />
        </div>
        <h3 className="text-lg font-semibold">Tu sesión óptima aparecerá aquí</h3>
        <p className="text-sm text-muted-foreground text-pretty">
          Configura tus parámetros y PokerOS seleccionará los torneos más compatibles con tu perfil y
          tu bankroll.
        </p>
      </CardContent>
    </Card>
  )
}

function CalendarSpark() {
  return <Sparkles className="size-6" />
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

function ResultState() {
  const summary = [
    { icon: Layers, label: 'Torneos', value: `${plannerResult.tournaments}` },
    { icon: Wallet, label: 'Buy-ins totales', value: usd(plannerResult.totalBuyins) },
    { icon: Target, label: 'ABI', value: usd(plannerResult.abi, { decimals: 2 }), tip: 'abi' },
    { icon: Wallet, label: 'Exposición', value: `${plannerResult.exposure}%`, tip: 'exposure' },
    { icon: Clock, label: 'Duración', value: plannerResult.duration },
  ]
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/25 bg-gradient-to-br from-primary/10 to-card">
        <CardContent className="flex flex-col gap-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-semibold tracking-wide uppercase">Tu sesión óptima para hoy</span>
            </div>
            <RiskBadge level={plannerResult.risk} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {summary.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {s.label}
                  {s.tip ? <MetricInfo metric={s.tip} /> : null}
                </span>
                <span className="font-mono text-xl font-semibold tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Timeline de torneos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-6">
          {plannerTimeline.map((t) => (
            <div
              key={t.time + t.name}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/30"
            >
              <div className="flex w-14 shrink-0 flex-col items-center">
                <span className="font-mono text-sm font-semibold tabular-nums">{t.time}</span>
                <span className="text-[10px] text-muted-foreground">{t.duration}</span>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{t.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{t.format}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{t.room}</span>
                  <span className="font-mono">{usd(t.buyin)}</span>
                  <span>Gtd {t.guaranteed}</span>
                  <span>Field {t.field}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <ScoreRing score={t.score} size={52} stroke={5} />
                <WhyDialog name={t.name} score={t.score} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function WhyDialog({ name, score }: { name: string; score: number }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Por qué ${name}`} className="hidden sm:flex" />
        }
      >
        <HelpCircle className="size-4 text-muted-foreground" />
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScoreRing score={score} size={44} stroke={4} showLabel={false} />
            PokerOS Score {score}/100
          </DialogTitle>
          <DialogDescription>{name}</DialogDescription>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-pretty">
          Excelente rendimiento histórico en este formato, exposición adecuada para tu bankroll y
          estructura compatible con tu perfil.
        </p>
        <div className="mt-1 flex flex-col gap-2">
          {[
            ['Rendimiento histórico en formato', 92],
            ['Ajuste de buy-in a tu bankroll', 88],
            ['Estructura vs. tu perfil', 84],
            ['Compatibilidad de horario', 79],
          ].map(([label, v]) => (
            <div key={label as string} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono tabular-nums">{v}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
