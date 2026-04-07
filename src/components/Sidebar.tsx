import { NavLink } from 'react-router-dom'
import { Home, CircleDot, PlusCircle, Users, Target, Settings, PawPrint, LayoutGrid } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type NavItem = { to: string; icon: LucideIcon; labelKey: string }

const items: NavItem[] = [
  { to: '/',        icon: Home,       labelKey: 'nav.dashboard'    },
  { to: '/budget',  icon: CircleDot,  labelKey: 'nav.bubbleBudget' },
  { to: '/log',     icon: PlusCircle, labelKey: 'nav.logExpense'   },
  { to: '/plans',   icon: LayoutGrid, labelKey: 'nav.myPlans'      },
  { to: '/goals',   icon: Target,     labelKey: 'nav.goals'        },
  { to: '/family',  icon: Users,      labelKey: 'nav.family'       },
  { to: '/profile', icon: Settings,   labelKey: 'nav.settings'     },
]

export function Sidebar() {
  const { t } = useTranslation()
  return (
    <nav className="hidden md:flex flex-col w-16 hover:w-56 transition-all duration-200 bg-white border-r border-brand-border min-h-screen overflow-hidden group z-50 fixed top-0 left-0 shadow-card">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-brand-border">
        <PawPrint size={24} className="text-brand-blue flex-shrink-0" strokeWidth={2} />
        <span className="text-gradient font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Budgeteria</span>
      </div>

      <div className="flex flex-col gap-1 pt-4 px-2 flex-1">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                isActive
                  ? 'text-brand-blue bg-sky-50'
                  : 'text-brand-muted hover:text-brand-navy hover:bg-brand-bg'
              }`
            }
          >
            <item.icon size={20} strokeWidth={1.8} className="flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
