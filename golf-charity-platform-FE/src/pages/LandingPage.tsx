import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Heart, Trophy, Target, Zap, Shield, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import type { Charity } from '@/types'

const features = [
  {
    icon: Target,
    title: 'Track 5 Scores',
    description: 'Enter your Stableford scores. Your rolling 5 define your active status.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Trophy,
    title: 'Monthly Prize Draw',
    description: 'Match 3, 4, or 5 numbers. Jackpots roll over when unclaimed.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Heart,
    title: 'Fund a Cause',
    description: 'At least 10% of every subscription goes to a charity you choose.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
]

const prizes = [
  { label: '5-Number Match', pct: '40%', desc: 'Jackpot Prize', color: 'from-amber-500 to-orange-500' },
  { label: '4-Number Match', pct: '35%', desc: 'Major Prize', color: 'from-indigo-500 to-purple-500' },
  { label: '3-Number Match', pct: '25%', desc: 'Minor Prize', color: 'from-emerald-500 to-teal-500' },
]

const stats = [
  { value: '£10/mo', label: 'Monthly Plan' },
  { value: '10%+', label: 'Goes to Charity' },
  { value: '5 Scores', label: 'To Stay Active' },
  { value: '3 Tiers', label: 'Prize Structure' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const [charities, setCharities] = useState<Charity[]>([])

  useEffect(() => {
    supabase.from('charities').select('*').order('is_featured', { ascending: false }).limit(6)
      .then(({ data }) => setCharities(data ?? []))
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white text-sm font-bold">GG</span>
          </div>
          <span className="font-bold text-xl tracking-tight">GolfGives</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate({ to: '/login' })}>
            Sign In
          </Button>
          <Button size="sm" onClick={() => navigate({ to: '/register' })}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400 font-medium mb-8">
            <Zap size={14} />
            Golf. Draw. Impact.
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Play Golf.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Win Prizes.
            </span>
            <br />
            <span className="text-slate-300">Change Lives.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A subscription platform where your monthly golf scores enter you into prize draws — and every
            membership directly funds charities that matter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate({ to: '/register' })} icon={<ArrowRight size={20} />}>
              Start Your Impact Journey
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate({ to: '/login' })}>
              I Already Have an Account
            </Button>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/8 bg-white/3 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">How It Works</h2>
          <p className="text-slate-400">Subscribe → Score → Select Charity → Enter Draw</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-2xl border border-white/8 bg-[#111827] p-6 hover:border-white/15 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className={f.color} size={22} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Prize Breakdown */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Prize Pool Breakdown</h2>
          <p className="text-slate-400">The prize pool grows with every active subscriber</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {prizes.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-white/8 bg-[#111827] p-6 overflow-hidden text-center"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${p.color}`} />
              <p className={`text-5xl font-extrabold mb-2 bg-gradient-to-r ${p.color} bg-clip-text text-transparent`}>
                {p.pct}
              </p>
              <p className="text-white font-semibold mb-1">{p.label}</p>
              <p className="text-slate-500 text-sm">{p.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center"
        >
          <TrendingUp className="inline mr-2 text-amber-400" size={18} />
          <span className="text-amber-300 text-sm font-medium">
            No 5-Number Match? The jackpot rolls over to next month — growing until it's claimed.
          </span>
        </motion.div>
      </section>

      {/* Charity Showcase */}
      {charities.length > 0 && (
        <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Charities You'll Support</h2>
            <p className="text-slate-400">Your subscription funds causes that matter — you choose which one</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {charities.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/8 bg-[#111827] p-5 hover:border-pink-500/20 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                      <Heart className="text-pink-400" size={20} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                      {c.is_featured && (
                        <span className="text-xs text-amber-400 font-medium shrink-0">★ Featured</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                    <p className="text-xs text-pink-400 mt-2 font-medium">
                      {formatCurrency(c.total_raised)} raised
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/30 to-indigo-900/30 p-6 sm:p-12 text-center backdrop-blur-sm"
        >
          <Shield className="mx-auto mb-4 text-emerald-400" size={36} />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Ready to Make an Impact?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Join the community of golfers turning their passion into positive change. Every score counts.
          </p>
          <Button size="lg" onClick={() => navigate({ to: '/register' })} icon={<ArrowRight size={20} />}>
            Join GolfGives Today
          </Button>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/8 py-8 text-center text-slate-600 text-sm">
        <p>© 2025 GolfGives. Golf. Draw. Impact.</p>
      </footer>
    </div>
  )
}
