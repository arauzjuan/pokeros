'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { primaryNav, type NavItem } from '@/lib/nav'
import { player } from '@/lib/data'
import { usd } from '@/lib/format'
import { Logo } from '@/components/logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname()
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
      )}
    >
      <Icon className={cn('size-4.5 shrink-0', active && 'text-primary')} />
      <span className="truncate">{item.label}</span>
      {active ? <span className="ml-auto size-1.5 rounded-full bg-primary" /> : null}
    </Link>
  )
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <Button className="mb-4 w-full justify-start" render={<Link href="/tournaments/new" onClick={onNavigate} />}>
          <Plus className="size-4" />
          Registrar torneo
        </Button>

        <div className="flex flex-col gap-1">
          {primaryNav.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={onNavigate} />
          ))}
        </div>

      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent/60"
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
              {player.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium">{player.name}</span>
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                {player.plan}
              </Badge>
            </div>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {usd(player.bankroll)}
            </span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  )
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border lg:block">
      <SidebarContent />
    </aside>
  )
}
