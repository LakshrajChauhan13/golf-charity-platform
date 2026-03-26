import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
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
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">You're in!</h2>
          <p className="text-slate-400">Account created. Redirecting to your dashboard…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start"
      >
        {/* Left panel */}
        <div className="hidden md:block">
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold">GG</span>
            </div>
            <span className="font-bold text-xl text-white">GolfGives</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Join the movement.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Play with purpose.
            </span>
          </h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Every swing counts. Every subscription funds something that matters.
          </p>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="text-emerald-400 shrink-0" size={18} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-emerald-300 text-sm font-medium">Starting from £10/month</p>
            <p className="text-slate-500 text-xs mt-1">10% minimum goes directly to your chosen charity</p>
          </div>
        </div>

        {/* Right panel */}
        <div>
          <div className="text-center mb-6 md:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">GG</span>
              </div>
              <span className="font-bold text-lg text-white">GolfGives</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#111827] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-slate-400 text-sm mb-6">Free to start — subscription required for draws.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Your name"
                error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input
                label="Email Address"
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
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                loading={isSubmitting}
                icon={<ArrowRight size={18} />}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-slate-600">OR</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/dashboard` },
                })
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
