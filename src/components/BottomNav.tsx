import { NavLink } from 'react-router-dom'
import { Home, CircleDot, PlusCircle, Users, LayoutGrid } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type NavItem = { to: string; icon: LucideIcon; labelKey: string }

const items: NavItem[] = [
  { to: '/',       icon: Home,       labelKey: 'nav.dashboard'  },
  { to: '/budget', icon: CircleDot,  labelKey: 'nav.bubbleBudget' },
  { to: '/log',    icon: PlusCircle, labelKey: 'nav.logExpense' },
  { to: '/plans',  icon: LayoutGrid, labelKey: 'nav.myPlans'    },
  { to: '/family', icon: Users,      labelKey: 'nav.family'     },
]

export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-brand-border md:hidden z-50">
      <div className="flex items-center justify-around px-1">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            aria-label={t(item.labelKey)}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                isActive ? 'text-brand-blue' : 'text-brand-muted hover:text-brand-navy'
              }`
            }
          >
            <item.icon size={20} strokeWidth={isActive(item.to) ? 2.2 : 1.8} />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

// Helper — NavLink doesn't expose isActive outside its render prop,
// so we check the path manually for the icon strokeWidth.
function isActive(to: string): boolean {
  const path = window.location.pathname
  return to === '/' ? path === '/' : path.startsWith(to)
}
