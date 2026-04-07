import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../auth/AuthProvider'
import { planApi, type InviteResponse } from '../api/planApi'
import { Card } from '../components/Card'
import { MemberAvatar } from '../components/MemberAvatar'
import { InviteModal } from '../components/InviteModal'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { isPendingMember } from '../api/types'
import { useTranslation } from 'react-i18next'
import { UserPlus, X, Clock } from 'lucide-react'

export function FamilyScreen() {
  const { plan, upsertPlan, refreshPlans } = useApp()
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [lastInvite, setLastInvite] = useState<InviteResponse | null>(null)

  if (!plan) return null

  const activeMembers = plan.members.filter(m => !isPendingMember(m))
  const canInvite = activeMembers.length < 7

  async function handleGenerate(email?: string) {
    if (!plan) return
    const emailLower = email?.trim().toLowerCase()
    if (emailLower && user?.email && emailLower === user.email.toLowerCase()) {
      toast(t('family.cantInviteSelf'), 'error')
      return
    }
    setIsGenerating(true)
    try {
      const invite = await planApi.inviteMember(plan.id, email?.trim())
      setLastInvite(invite)
      await refreshPlans()
      if (email) toast(t('family.inviteSent', { email }))
      else toast(t('family.inviteLinkGenerated'))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast(t('family.inviteFailed', { error: msg }), 'error')
      throw err
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleRemove(memberId: string) {
    if (!plan) return
    try {
      await planApi.removeMember(plan.id, memberId)
      await refreshPlans()
      toast(t('family.memberRemoved'))
    } catch (err) {
      console.error(err)
      toast(t('family.removeFailed'), 'error')
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-brand-navy">{t('family.title')}</h1>
        <p className="text-brand-muted text-sm mt-0.5">{plan.name}</p>
      </div>

      {/* Active members */}
      <Card className="animate-fade-in-up delay-75">
        {plan.members.filter(m => !isPendingMember(m)).map((member, i, arr) => {
          const isCurrentUser = member.userId === user?.id
          const displayName = isCurrentUser
            ? (user?.name || member.name || member.email)
            : (member.name || member.email)
          const displayAvatar = isCurrentUser ? (user?.avatar || member.avatar) : member.avatar

          return (
            <div
              key={member.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-brand-border' : ''}`}
            >
              <MemberAvatar name={displayName} avatar={displayAvatar} />
              <div className="flex-1 min-w-0">
                <p className="text-brand-navy text-sm font-medium truncate">
                  {displayName}
                  {isCurrentUser && <span className="text-brand-muted text-xs ml-1">({t('common.you')})</span>}
                </p>
                <p className="text-brand-muted text-xs">{member.email}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                member.role === 'admin' ? 'bg-sky-50 text-brand-blue' : 'bg-pink-50 text-pink-500'
              }`}>
                {member.role === 'admin' ? t('common.admin') : t('common.member')}
              </span>
              {member.role !== 'admin' && (
                <button
                  onClick={() => handleRemove(member.id)}
                  className="text-brand-muted hover:text-brand-danger transition-colors p-1 ml-1"
                  aria-label={`${t('common.remove')} ${displayName}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )
        })}
      </Card>

      {/* Pending invitations */}
      {plan.members.some(m => isPendingMember(m)) && (
        <div className="animate-fade-in-up delay-100">
          <h2 className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-2">{t('family.pendingInvitations')}</h2>
          <Card>
            {plan.members.filter(m => isPendingMember(m)).map((member, i, arr) => (
              <div
                key={member.id}
                className={`flex items-center gap-3 px-4 py-3 opacity-60 ${i < arr.length - 1 ? 'border-b border-brand-border' : ''}`}
              >
                <MemberAvatar name={member.email || '?'} />
                <div className="flex-1 min-w-0">
                  <p className="text-brand-navy text-sm font-medium truncate">
                    {member.email || t('family.pendingInvite')}
                  </p>
                  {member.email && <p className="text-brand-muted text-xs">{member.email}</p>}
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
                  <Clock size={12} />
                  invited
                </span>
                <button
                  onClick={() => handleRemove(member.id)}
                  className="text-brand-muted hover:text-brand-danger transition-colors p-1 ml-1"
                  aria-label="Cancel invitation"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </Card>
        </div>
      )}

      {canInvite ? (
        <Button
          variant="dashed"
          onClick={() => { setLastInvite(null); setShowInvite(true) }}
          className="w-full"
        >
          <UserPlus size={16} strokeWidth={2} />
          {t('family.invite')}
        </Button>
      ) : (
        <p className="text-center text-brand-muted text-xs py-2">
          {t('family.maxReached')}
        </p>
      )}

      <InviteModal
        isOpen={showInvite}
        isLoading={isGenerating}
        inviteUrl={lastInvite?.inviteUrl}
        onClose={() => setShowInvite(false)}
        onGenerate={handleGenerate}
      />
    </div>
  )
}
