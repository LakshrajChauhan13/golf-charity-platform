import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090b] disabled:opacity-40 disabled:cursor-not-allowed select-none'

    const variants = {
      primary:
        'bg-emerald-600 hover:bg-emerald-500 text-white focus-visible:ring-emerald-600',
      secondary:
        'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 hover:border-zinc-600 focus-visible:ring-zinc-600',
      ghost:
        'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 focus-visible:ring-zinc-700',
      danger:
        'bg-red-600 hover:bg-red-500 text-white focus-visible:ring-red-600',
      outline:
        'border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100 focus-visible:ring-zinc-600',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-sm',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </motion.button>
    )
  },
)
Button.displayName = 'Button'
