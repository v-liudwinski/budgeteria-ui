import { useEffect, useState } from 'react'
import { Button } from './Button'
import { X, Copy, Check, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type Props = {
  isOpen: boolean
  isLoading?: boolean
  inviteUrl?: string        // set after a link is generated
  onClose: () => void
  onGenerate: (email?: string) => Promise<void>
}

export function InviteModal({ isOpen, isLoading = false, inviteUrl, onClose, onGenerate }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setError('')
      setCopied(false)
    }
  }, [isOpen])

  // Auto-copy when invite URL is generated
  useEffect(() => {
    if (inviteUrl && isOpen) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {
        // Clipboard API might be blocked; user can still click Copy
      })
    }
  }, [inviteUrl, isOpen])

  if (!isOpen) return null

  async function handleGenerateLink() {
    setError('')
    try {
      await onGenerate()
    } catch {
      setError(t('family.inviteModal.failed'))
    }
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError(t('family.inviteModal.enterEmail')); return }
    setError('')
    try {
      await onGenerate(email.trim())
    } catch {
      setError(t('family.inviteModal.emailFailed'))
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white border border-brand-border rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6 z-10 shadow-soft animate-slide-up">

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-brand-navy font-semibold text-lg">{t('family.inviteModal.title')}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-navy transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Invite link section */}
        {inviteUrl ? (
          <div className="mb-5">
            <p className="text-brand-muted text-xs mb-2">{t('family.inviteModal.shareLink')}</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 min-w-0 bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-navy font-mono truncate focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t('family.inviteModal.copied') : t('family.inviteModal.copy')}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-5">
            <Button
              onClick={handleGenerateLink}
              disabled={isLoading}
              className="w-full"
            >
              <Copy size={16} />
              {isLoading ? t('family.inviteModal.generating') : t('family.inviteModal.generateLink')}
            </Button>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-brand-border" />
          <span className="text-brand-muted text-xs">{t('family.inviteModal.orSendEmail')}</span>
          <div className="flex-1 h-px bg-brand-border" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSendEmail} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('family.inviteModal.emailPlaceholder')}
            className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/60"
          />
          {error && <p className="text-brand-danger text-xs">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading || !email.trim()} className="flex-1">
              <Send size={14} />
              {isLoading ? t('family.inviteModal.sending') : t('family.inviteModal.sendInvite')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
