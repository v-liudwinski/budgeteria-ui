import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="md:pl-14 pb-24 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
