import { ProfilePopover } from '../components/ProfilePopover'

export function ProfileScreen() {
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-slate-100 text-2xl font-bold mb-6">Profile & Settings 👤</h1>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl">
        <ProfilePopover />
      </div>
    </div>
  )
}
