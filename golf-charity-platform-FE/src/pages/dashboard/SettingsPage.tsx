import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, CreditCard, Shield, CheckCircle, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { formatDate } from '@/lib/utils'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
})
type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Minimum 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] })
type PasswordForm = z.infer<typeof passwordSchema>

export function SettingsPage() {
  const profile = useAppSelector((s) => s.auth.profile)
  const user = useAppSelector((s) => s.auth.user)
  const { refreshProfile } = useAuth()
  const [profileSaved, setProfileSaved] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const { subscribe, manageBilling, loading: subLoading, portalLoading, error: subError } = useSubscription()

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  })
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  async function onProfileSave(data: ProfileForm) {
    if (!profile) return
    await supabase.from('profiles').update({ full_name: data.full_name }).eq('id', profile.id)
    await refreshProfile()
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  async function onPasswordSave(data: PasswordForm) {
    await supabase.auth.updateUser({ password: data.password })
    passwordForm.reset()
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 2500)
  }

  const statusMap = {
    active: { label: 'Active', variant: 'success' as const },
    trialing: { label: 'Trialing', variant: 'info' as const },
    past_due: { label: 'Past Due', variant: 'warning' as const },
    canceled: { label: 'Canceled', variant: 'danger' as const },
    inactive: { label: 'Inactive', variant: 'neutral' as const },
  }
  const sub = statusMap[profile?.subscription_status ?? 'inactive']

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your profile, subscription, and security</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <User className="text-emerald-400" size={18} />
            </div>
            <h3 className="text-base font-semibold text-white">Profile</h3>
          </div>
          <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Your name"
              error={profileForm.formState.errors.full_name?.message}
              {...profileForm.register('full_name')}
            />
            <Input label="Email Address" value={user?.email ?? ''} disabled readOnly />
            <Button
              type="submit"
              size="sm"
              loading={profileForm.formState.isSubmitting}
              icon={profileSaved ? <CheckCircle size={15} /> : undefined}
              variant={profileSaved ? 'ghost' : 'primary'}
            >
              {profileSaved ? 'Saved!' : 'Save Profile'}
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Subscription */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <CreditCard className="text-indigo-400" size={18} />
            </div>
            <h3 className="text-base font-semibold text-white">Subscription</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">Plan</p>
                <p className="text-xs text-slate-500 capitalize">
                  {profile?.subscription_period ?? 'No active plan'}
                </p>
              </div>
              <Badge variant={sub.variant}>{sub.label}</Badge>
            </div>

            {profile?.subscription_current_period_end && (
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Renewal Date</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(profile.subscription_current_period_end)}
                  </p>
                </div>
              </div>
            )}

            {subError && (
              <p className="text-xs text-red-400 px-1">{subError}</p>
            )}
            <div className="flex gap-3 pt-1">
              {profile?.subscription_status === 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  loading={portalLoading}
                  icon={<ExternalLink size={14} />}
                  onClick={manageBilling}
                >
                  Manage Billing
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    loading={subLoading}
                    onClick={() => subscribe('monthly')}
                  >
                    Monthly — £10/mo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={subLoading}
                    onClick={() => subscribe('yearly')}
                  >
                    Yearly — £100/yr
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Shield className="text-amber-400" size={18} />
            </div>
            <h3 className="text-base font-semibold text-white">Change Password</h3>
          </div>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="8+ characters"
              error={passwordForm.formState.errors.password?.message}
              {...passwordForm.register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              error={passwordForm.formState.errors.confirm?.message}
              {...passwordForm.register('confirm')}
            />
            <Button
              type="submit"
              size="sm"
              variant={pwSaved ? 'ghost' : 'primary'}
              loading={passwordForm.formState.isSubmitting}
              icon={pwSaved ? <CheckCircle size={15} /> : undefined}
            >
              {pwSaved ? 'Password Updated!' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
