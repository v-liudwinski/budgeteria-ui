import { useAuth } from '../auth/AuthProvider'
import { Navigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { PawPrint, BarChart3, Users, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function LoginScreen() {
  const { isAuthenticated, isReady, login, register, loginWithGoogle, auth0Error } = useAuth()
  const { t } = useTranslation()

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-brand-blue/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-pink/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-brand-blue/10 rounded-full blur-2xl pointer-events-none animate-pulse" />

      <div className="relative bg-white rounded-3xl shadow-soft border border-brand-border p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-pink/20 mb-3 animate-bounce-slow">
            <PawPrint size={32} className="text-brand-blue" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Budgeteria</h1>
          <p className="text-brand-muted text-sm">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Error display */}
        {auth0Error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 break-all">
            Auth0: {auth0Error.message}
          </div>
        )}

        {/* Auth buttons */}
        <div className="space-y-3">
          <Button onClick={() => login()} size="lg" className="w-full">
            {t('auth.signIn')}
          </Button>

          <button
            type="button"
            onClick={register}
            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand-navy hover:bg-white hover:shadow-sm transition-all"
          >
            {t('auth.register')}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-brand-border" />
          <span className="text-brand-muted text-xs">{t('auth.or')}</span>
          <div className="flex-1 h-px bg-brand-border" />
        </div>

        {/* Google auth */}
        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border border-brand-border rounded-xl px-4 py-3 text-sm font-medium text-brand-navy hover:bg-brand-bg hover:shadow-sm transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58Z" fill="#EA4335"/>
          </svg>
          {t('auth.signInWithGoogle')}
        </button>

        {/* Features */}
        <div className="flex flex-col gap-2.5 mt-6 pt-5 border-t border-brand-border">
          {[
            { icon: BarChart3, text: 'Smart budget planning with AI insights' },
            { icon: Users,     text: 'Share plans with your whole family' },
            { icon: Target,    text: 'Track goals from vacation to savings' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-brand-muted">
              <div className="w-7 h-7 rounded-lg bg-brand-bg flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-brand-blue" strokeWidth={2} />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <p className="text-brand-muted text-xs mt-5 text-center">
          Free for families. No credit card needed.
        </p>
      </div>
    </div>
  )
}
