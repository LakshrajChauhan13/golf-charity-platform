import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string | null
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

export function Avatar({ name, avatarUrl, size = 'md', className }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? 'User'}
        className={cn('rounded-full object-cover ring-2 ring-white/10', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        'bg-gradient-to-br from-emerald-500 to-indigo-600 text-white',
        'ring-2 ring-white/10',
        sizes[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  )
}
