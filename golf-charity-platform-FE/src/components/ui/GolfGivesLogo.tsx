import { useId } from 'react'

interface GolfGivesLogoProps {
  size?: number
  className?: string
}

export function GolfGivesLogo({ size = 32, className }: GolfGivesLogoProps) {
  const uid = useId().replace(/:/g, '')
  const gradId = `gg-gold-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="1" />
          <stop offset="100%" stopColor="#F3E5AB" stopOpacity="1" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="95" fill="#064E3B" />

      <path
        d="M145 100C145 124.853 124.853 145 100 145C75.1472 145 55 124.853 55 100C55 75.1472 75.1472 55 100 55C118.5 55 134.5 66.5 141 82.5"
        stroke={`url(#${gradId})`}
        strokeWidth="12"
        strokeLinecap="round"
      />

      <path
        d="M100 100L155 100"
        stroke={`url(#${gradId})`}
        strokeWidth="12"
        strokeLinecap="round"
      />

      <circle cx="100" cy="100" r="8" fill={`url(#${gradId})`} />

      <circle cx="100" cy="100" r="90" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
    </svg>
  )
}
