import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useApp } from '../context/AppContext'
import { planApi } from '../api/planApi'
import { Button } from '../components/Button'
import { PawPrint, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type Status = 'loading' | 'success' | 'error' | 'no-token'

export function AcceptInviteScreen() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, isReady, login } = useAuth()
  const { upsertPlan } = useApp()
  const { t } = useTranslation()
  const token = params.get('token')

  const [status, setStatus] = useState<Status>(token ? 'loading' : 'no-token')
  const [errorMsg, setErrorMsg] = useState('')
  const [planName, setPlanName] = useState('')

  useEffect(() => {
    if (!token || !isReady) return

    if (!isAuthenticated) {
      login(`/invite/accept?token=${token}`)
      return
    }

    async function accept() {
      try {
        const plan = await planApi.acceptInvite(token!)
        setPlanName(plan.name)
        upsertPlan(plan)
        setStatus('success')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setErrorMsg(msg)
        setStatus('error')
      }
    }

    accept()
  }, [token, isAuthenticated, isReady, login, upsertPlan])

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 w-72 h-72 bg-brand-blue/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-pink/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative bg-white rounded-3xl shadow-soft border border-brand-border p-8 w-full max-w-sm text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-pink/20 mb-4">
          <PawPrint size={28} className="text-brand-blue" strokeWidth={2} />
        </div>

        {status === 'loading' && (
          <div className="animate-fade-in-up">
            <Loader2 size={32} className="text-brand-blue animate-spin mx-auto mb-3" />
            <h2 className="text-brand-navy font-bold text-lg mb-1">{t('invite.joining')}</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fade-in-up">
            <CheckCircle2 size={40} className="text-brand-success mx-auto mb-3" />
            <h2 className="text-brand-navy font-bold text-lg mb-1">{t('invite.success')}</h2>
            <p className="text-brand-muted text-sm mb-5">
              {t('invite.successDesc', { plan: planName })}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              {t('invite.goHome')}
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-in-up">
            <XCircle size={40} className="text-brand-danger mx-auto mb-3" />
            <h2 className="text-brand-navy font-bold text-lg mb-1">{t('invite.couldntJoin')}</h2>
            <p className="text-brand-muted text-sm mb-5">{errorMsg}</p>
            <Button variant="secondary" onClick={() => navigate('/')} className="w-full">
              {t('common.goHome')}
            </Button>
          </div>
        )}

        {status === 'no-token' && (
          <div className="animate-fade-in-up">
            <XCircle size={40} className="text-brand-warning mx-auto mb-3" />
            <h2 className="text-brand-navy font-bold text-lg mb-1">{t('invite.invalidToken')}</h2>
            <Button variant="secondary" onClick={() => navigate('/')} className="w-full">
              {t('common.goHome')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
