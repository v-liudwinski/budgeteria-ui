type Props = {
  value: number    // 0-100
  size?: number    // px
  strokeWidth?: number
  color?: string   // tailwind text color class
  label?: string
}

export function ProgressRing({ value, size = 80, strokeWidth = 6, color = 'text-brand-blue', label }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E0F2FE"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} transition-all duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-brand-navy font-bold" style={{ fontSize: size * 0.22 }}>{value}</span>
        {label && <span className="text-brand-muted" style={{ fontSize: size * 0.12 }}>{label}</span>}
      </div>
    </div>
  )
}
