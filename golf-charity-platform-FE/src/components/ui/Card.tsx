import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  glow?: boolean
  onClick?: () => void
}

export function Card({ className, children, glow, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-white/8 bg-[#111827] p-6',
        glow && 'shadow-lg shadow-emerald-500/10',
        onClick && 'cursor-pointer hover:border-white/15 transition-colors',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-lg font-semibold text-white', className)}>{children}</h3>
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn(className)}>{children}</div>
}
