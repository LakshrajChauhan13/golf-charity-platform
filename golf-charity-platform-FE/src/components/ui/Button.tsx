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
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

    const variants = {
      primary:
        'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 focus-visible:ring-emerald-500',
      secondary:
        'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 focus-visible:ring-indigo-500',
      ghost:
        'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white focus-visible:ring-white/20',
      danger:
        'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 focus-visible:ring-red-500',
      outline:
        'border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-300 hover:text-white focus-visible:ring-emerald-500',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
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
