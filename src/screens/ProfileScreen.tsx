import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Card } from '../components/Card'
import { useNavigate } from 'react-router-dom'
import { Pencil, LogOut } from 'lucide-react'
import { MemberAvatar } from '../components/MemberAvatar'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { useTranslation } from 'react-i18next'

export function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t, i18n } = useTranslation()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState(user?.name ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const LANGUAGES = [
    { code: 'en', label: t('settings.languages.en') },
    { code: 'cs', label: t('settings.languages.cs') },
    { code: 'uk', label: t('settings.languages.uk') },
  ]

  function handleEditProfile() {
    setEditName(user?.name ?? '')
    setIsEditingProfile(true)
  }

  async function handleSaveProfile() {
    if (!editName.trim()) return
    setIsSaving(true)
    try {
      await updateProfile({ name: editName.trim() })
      setIsEditingProfile(false)
      toast(t('settings.profileUpdated'))
    } catch (err) {
      console.error('Profile update failed:', err)
      toast(t('settings.profileFailed'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  function changeLanguage(code: string) {
    i18n.changeLanguage(code)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy animate-fade-in-up">{t('settings.title')}</h1>

      {/* Profile */}
      <Card className="p-5 animate-fade-in-up delay-75">
        {isEditingProfile ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4 mb-2">
              <MemberAvatar name={editName || 'U'} avatar={user?.avatar} size="lg" />
              <h2 className="text-brand-navy font-semibold">{t('settings.editProfile')}</h2>
            </div>
            <div>
              <label className="text-brand-navy text-xs font-semibold block mb-1">{t('settings.name')}</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                autoFocus
              />
            </div>
            <div>
              <label className="text-brand-navy text-xs font-semibold block mb-1">{t('settings.email')}</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-muted text-sm cursor-not-allowed"
              />
              <p className="text-brand-muted text-[10px] mt-1">{t('settings.emailManaged')}</p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleSaveProfile} disabled={isSaving} className="flex-1">
                {isSaving ? t('common.saving') : t('common.save')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setIsEditingProfile(false)} disabled={isSaving} className="flex-1">
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <MemberAvatar name={user?.name ?? 'User'} avatar={user?.avatar} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-brand-navy font-semibold truncate">{user?.name}</p>
              <p className="text-brand-muted text-sm truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleEditProfile}
              className="text-brand-blue hover:text-brand-navy transition-colors p-1.5 rounded-lg hover:bg-brand-bg flex-shrink-0"
              aria-label={t('settings.editProfile')}
            >
              <Pencil size={16} />
            </button>
          </div>
        )}
      </Card>

      {/* Language */}
      <Card className="p-5 space-y-3 animate-fade-in-up delay-150">
        <h2 className="text-brand-navy font-semibold">{t('settings.language')}</h2>
        <div className="flex gap-2 flex-wrap">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                i18n.language === lang.code
                  ? 'border-brand-blue bg-sky-50 text-brand-blue shadow-sm'
                  : 'border-brand-border text-brand-muted hover:border-brand-blue/40'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Logout */}
      <Button
        variant="danger"
        onClick={() => { logout(); navigate('/login') }}
        className="w-full animate-fade-in-up delay-300"
      >
        <LogOut size={16} strokeWidth={2.2} />
        {t('settings.signOut')}
      </Button>
    </div>
  )
}
