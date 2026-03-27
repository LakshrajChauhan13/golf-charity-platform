import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { GolfGivesLogo } from '@/components/ui/GolfGivesLogo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })
type FormData = z.infer<typeof schema>

const benefits = [
  'Enter monthly prize draws',
  'Choose your charity destination',
  'Track your Stableford scores',
  'Cancel anytime',
]

export function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
      },
    })
    if (error) {
      setServerError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => navigate({ to: '/dashboard' }), 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-14 h-14 rounded-md bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="text-emerald-500" size={28} />
          </div>
          <h2 className="text-xl font-bold text-zinc-50 mb-2">You're in!</h2>
          <p className="text-sm text-zinc-500">Account created. Redirecting to your dashboard…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl grid md:grid-cols-2 gap-10 items-start"
      >
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-center pt-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <GolfGivesLogo size={30} />
            <span className="font-semibold text-zinc-50">GolfGives</span>
          </Link>
          <h1 className="text-3xl font-bold text-zinc-50 leading-tight mb-3">
            Play golf.<br />
            <span className="text-emerald-500">Give back.</span>
          </h1>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            Every swing counts. Every subscription funds something that matters.
          </p>
          <ul className="space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-xs text-zinc-400">
                <CheckCircle className="text-emerald-500 shrink-0" size={14} />
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-md border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="text-sm font-medium text-zinc-200">Starting from £10/month</p>
            <p className="text-xs text-zinc-500 mt-0.5">10% minimum goes directly to your chosen charity</p>
          </div>
        </div>

        {/* Right panel */}
        <div>
          <div className="text-center mb-6 md:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <GolfGivesLogo size={30} />
              <span className="font-semibold text-zinc-50">GolfGives</span>
            </Link>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-bold text-zinc-50 mb-0.5">Create your account</h2>
            <p className="text-xs text-zinc-500 mb-5">Free to start — subscription required for draws.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <Input
                label="Full Name"
                placeholder="Your name"
                error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="8+ characters"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                error={errors.confirm_password?.message}
                {...register('confirm_password')}
              />

              {serverError && (
                <div className="rounded-md border border-red-500/20 bg-red-500/8 px-3 py-2.5 text-xs text-red-400">
                  {serverError}
                </div>
              )}

              <Button type="submit" className="w-full mt-1" size="md" loading={isSubmitting}>
                Create account
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              size="md"
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/dashboard` },
                })
              }}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-xs text-zinc-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-zinc-400 hover:text-zinc-200 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
