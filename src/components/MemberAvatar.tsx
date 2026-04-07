import { useState } from 'react'

type Size = 'sm' | 'md' | 'lg'

type Props = {
  name: string
  avatar?: string
  size?: Size
  className?: string
}

const sizeClasses: Record<Size, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl',
}

export function MemberAvatar({ name, avatar, size = 'md', className = '' }: Props) {
  const [imgError, setImgError] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  // Show image only if avatar URL exists and hasn't errored
  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-brand-blue to-brand-pink flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      aria-label={name}
      title={name}
    >
      {initial}
    </div>
  )
}
