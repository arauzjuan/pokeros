'use client'

import { useState } from 'react'
import { Bell, TrendingUp, TriangleAlert, Info } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { notifications } from '@/lib/data'
import { cn } from '@/lib/utils'

const iconMap = {
  profit: { icon: TrendingUp, cls: 'text-profit bg-profit/15' },
  warning: { icon: TriangleAlert, cls: 'text-warning bg-warning/15' },
  info: { icon: Info, cls: 'text-primary bg-primary/15' },
}

export function Notifications() {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones" />
        }
      >
        <Bell className="size-5" />
        <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background" />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Notificaciones</SheetTitle>
          <SheetDescription>Actividad reciente de tu carrera.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 overflow-y-auto px-2 pb-4">
          {notifications.map((n, i) => {
            const { icon: Icon, cls } = iconMap[n.type as keyof typeof iconMap]
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', cls)}>
                  <Icon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm leading-snug text-pretty">{n.text}</p>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
