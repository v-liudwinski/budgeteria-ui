import { NavLink } from 'react-router-dom'

type NavItem = { to: string; icon: string; label: string }

const items: NavItem[] = [
  { to: '/',        icon: '🏠', label: 'Home'     },
  { to: '/budget',  icon: '💰', label: 'Budget'   },
  { to: '/log',     icon: '📋', label: 'Expenses' },
  { to: '/profile', icon: '👤', label: 'Profile'  },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 md:hidden z-50">
      <div className="flex items-center justify-around px-2">
        {items.map((item, i) => {
          // FAB in the middle (after index 1)
          if (i === 2) {
            return (
              <NavLink
                key="log-fab"
                to="/log"
                aria-label="Log Expense"
                className="-mt-5 bg-gradient-to-br from-emerald-400 to-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-900/40"
              >
                ➕
              </NavLink>
            )
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-3 px-4 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
