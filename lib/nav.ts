import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  History,
  CalendarClock,
  Sparkles,
  GraduationCap,
  Target,
  Plug,
  FileText,
  Settings,
  Users,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const primaryNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Rendimiento', href: '/rendimiento', icon: TrendingUp },
  { label: 'Bankroll', href: '/bankroll', icon: Wallet },
  { label: 'Sesiones', href: '/sesiones', icon: History },
  { label: 'Planificador', href: '/planificador', icon: CalendarClock },
  { label: 'PokerOS AI', href: '/ai', icon: Sparkles },
  { label: 'Estudio', href: '/estudio', icon: GraduationCap },
  { label: 'Objetivos', href: '/objetivos', icon: Target },
]

export const secondaryNav: NavItem[] = [
  { label: 'Equipos', href: '/equipos', icon: Users },
  { label: 'Integraciones', href: '/integraciones', icon: Plug },
  { label: 'Reportes', href: '/reportes', icon: FileText },
  { label: 'Precios', href: '/precios', icon: CreditCard },
  { label: 'Configuración', href: '/configuracion', icon: Settings },
]
