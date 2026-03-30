import { NavLink } from 'react-router-dom'

const items = [
  { to: '/',       icon: '🏠', label: 'Dashboard'    },
  { to: '/budget', icon: '💰', label: 'Bubble Budget' },
  { to: '/log',    icon: '➕', label: 'Log Expense'   },
]

export function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col w-14 hover:w-52 transition-all duration-200 bg-slate-900 border-r border-slate-800 min-h-screen overflow-hidden group z-50 fixed top-0 left-0">
      <div className="flex flex-col items-center group-hover:items-start gap-1 pt-6 pb-4 px-2 flex-1">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors text-sm font-medium ${
                isActive
                  ? 'text-emerald-400 bg-emerald-950/60'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
        <div className="flex-1" />
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors text-sm font-medium ${
              isActive ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
            }`
          }
        >
          <span className="text-xl flex-shrink-0">👤</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Profile</span>
        </NavLink>
      </div>
    </nav>
  )
}
