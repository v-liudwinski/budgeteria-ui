import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BudgetProvider } from './context/BudgetContext'
import { Layout } from './components/Layout'
import { DashboardScreen } from './screens/DashboardScreen'
import { BubbleBudgetScreen } from './screens/BubbleBudgetScreen'
import { ExpenseLogScreen } from './screens/ExpenseLogScreen'
import { ProfileScreen } from './screens/ProfileScreen'

export default function App() {
  return (
    <BudgetProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/"        element={<DashboardScreen />}   />
            <Route path="/budget"  element={<BubbleBudgetScreen />} />
            <Route path="/log"     element={<ExpenseLogScreen />}   />
            <Route path="/profile" element={<ProfileScreen />}      />
          </Routes>
        </Layout>
      </BrowserRouter>
    </BudgetProvider>
  )
}
