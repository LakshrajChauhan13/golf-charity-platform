import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-zinc-400">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-md border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600',
            'focus:outline-none focus:ring-1 focus:ring-emerald-600/60 focus:border-emerald-600/60',
            'transition-colors duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-red-500/60 focus:ring-red-500/40',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
