import {
  LayoutDashboard,
  Trophy,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Torneos", href: "/tournaments", icon: Trophy },
  { label: "Bankroll", href: "/bankroll", icon: Wallet },
  { label: "Perfil", href: "/profile", icon: UserRound },
];
