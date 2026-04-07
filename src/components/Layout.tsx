import { useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { QuickAddExpense } from './QuickAddExpense'
import { Plus } from 'lucide-react'

export function Layout({ children }: { children: ReactNode }) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const location = useLocation()
  const isExpenseLog = location.pathname === '/log'

  return (
    <div className="min-h-screen bg-brand-bg">
      <Sidebar />
      <main className="md:pl-16 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />

      {/* FAB — hidden on expense log page since it has its own form */}
      {!isExpenseLog && (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-gradient-to-br from-brand-blue to-brand-pink rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl hover:scale-110 active:scale-95 transition-all z-40"
          aria-label="Quick add expense"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}

      <QuickAddExpense isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
    </div>
  )
}
