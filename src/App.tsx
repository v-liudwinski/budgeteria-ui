import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Auth0Provider } from '@auth0/auth0-react'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { AppProvider, useApp } from './context/AppContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { ToastProvider } from './components/Toast'
import { Layout } from './components/Layout'
import { useTranslation } from 'react-i18next'
import { LoginScreen } from './screens/LoginScreen'
import { OnboardingWizard } from './screens/onboarding/OnboardingWizard'
import { DashboardScreen } from './screens/DashboardScreen'
import { BubbleBudgetScreen } from './screens/BubbleBudgetScreen'
import { ExpenseLogScreen } from './screens/ExpenseLogScreen'
import { FamilyScreen } from './screens/FamilyScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { GoalsScreen } from './screens/GoalsScreen'
import { PlansScreen } from './screens/PlansScreen'
import { AcceptInviteScreen } from './screens/AcceptInviteScreen'
import { CategoriesScreen } from './screens/CategoriesScreen'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
})

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Auth0ProviderWithNavigate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      onRedirectCallback={(appState) => {
        navigate(appState?.returnTo || '/', { replace: true })
      }}
    >
      {children}
    </Auth0Provider>
  )
}

/**
 * Guards main app routes:
 * - Still loading → spinner
 * - Error → retry screen
 * - No plans → onboarding
 * - Has plans → render children
 */
function PlanGate({ children }: { children: React.ReactNode }) {
  const { plans, isPlansLoading, plansError, refreshPlans } = useApp()
  const { t } = useTranslation()

  if (isPlansLoading) return <FullScreenSpinner />

  if (plansError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
        <div className="bg-white rounded-2xl shadow-soft border border-brand-border p-6 max-w-sm w-full text-center">
          <p className="text-brand-navy font-semibold mb-2">{t('errors.loadPlans')}</p>
          <p className="text-brand-muted text-sm mb-4">{plansError.message}</p>
          <button
            onClick={() => refreshPlans()}
            className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  if (!plans.length) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}

function AppRoutes() {
  const { plans, isPlansLoading } = useApp()

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />

      {/* Accept invitation — public, handles its own auth redirect */}
      <Route path="/invite/accept" element={<AcceptInviteScreen />} />

      {/* Onboarding: accessible any time to create a new plan */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          {isPlansLoading ? <FullScreenSpinner /> : <OnboardingWizard />}
        </ProtectedRoute>
      } />

      {/* Main app: requires at least one plan */}
      <Route path="/*" element={
        <ProtectedRoute>
          <PlanGate>
            <Layout>
              <Routes>
                <Route path="/"        element={<DashboardScreen />}    />
                <Route path="/budget"  element={<BubbleBudgetScreen />} />
                <Route path="/log"     element={<ExpenseLogScreen />}   />
                <Route path="/family"  element={<FamilyScreen />}       />
                <Route path="/goals"   element={<GoalsScreen />}        />
                <Route path="/plans"   element={<PlansScreen />}        />
                <Route path="/profile"     element={<ProfileScreen />}     />
                <Route path="/categories" element={<CategoriesScreen />}  />
              </Routes>
            </Layout>
          </PlanGate>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  )
}
