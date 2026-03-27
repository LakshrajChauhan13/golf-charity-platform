import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Heart, Trophy, Target, Zap, Shield, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GolfGivesLogo } from '@/components/ui/GolfGivesLogo'
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 overflow-x-hidden">
      {/* Subtle single radial glow — not bubbly, just depth */}
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center">
        <div className="mt-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-950/40 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <GolfGivesLogo size={32} />
            <span className="font-semibold text-lg tracking-tight text-zinc-50">GolfGives</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate({ to: '/login' })}>
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate({ to: '/register' })}>
              Get started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400 font-medium mb-8 tracking-wide uppercase">
            <Zap size={11} className="text-emerald-500" />
            Golf · Draw · Impact
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6 text-zinc-50">
            Play Golf.{' '}
            <span className="text-emerald-500">Win Prizes.</span>
            <br />
            Change Lives.
          </h1>

          <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Subscribe, log your Stableford scores, and enter monthly prize draws —
            while every membership directly funds the charity you choose.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate({ to: '/register' })} icon={<ArrowRight size={16} />}>
              Create an account
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate({ to: '/login' })}>
              Sign in
            </Button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 pt-8 border-t border-zinc-800/60 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-zinc-50 mb-0.5">{s.value}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-xs text-emerald-500 font-medium uppercase tracking-widest mb-2">How it works</p>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-50">Simple by design</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 hover:border-zinc-700 transition-colors duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-zinc-600">0{i + 1}</span>
                <f.icon className={f.color} size={17} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{f.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{f.description}</p>
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
          className="mb-10"
        >
          <p className="text-xs text-emerald-500 font-medium uppercase tracking-widest mb-2">Prize pool</p>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-50">How winnings are split</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4">
          {prizes.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5"
            >
              <p className="text-4xl font-bold text-zinc-50 mb-1">{p.pct}</p>
              <p className="text-sm font-medium text-zinc-300 mb-0.5">{p.desc}</p>
              <p className="text-xs text-zinc-500">{p.label}</p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-4 flex items-center gap-2.5 rounded-md border border-zinc-800 bg-zinc-900/40 px-4 py-3"
        >
          <TrendingUp className="text-zinc-500 shrink-0" size={15} />
          <p className="text-xs text-zinc-400">
            No 5-number match? The jackpot rolls over — growing until it's claimed.
          </p>
        </motion.div>
      </section>

      {/* Charity Showcase */}
      {charities.length > 0 && (
        <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-xs text-emerald-500 font-medium uppercase tracking-widest mb-2">Charities</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-50">You choose where it goes</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {charities.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-md object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
                      <Heart className="text-zinc-500" size={16} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-zinc-100 truncate">{c.name}</p>
                      {c.is_featured && (
                        <span className="text-[10px] text-emerald-500 font-medium shrink-0">Featured</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{formatCurrency(c.total_raised)} raised</p>
                  </div>
                </div>
                {c.description && (
                  <p className="text-xs text-zinc-600 mt-3 line-clamp-2 leading-relaxed">{c.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium uppercase tracking-widest">Ready to join?</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 mb-2">Make your golf count.</h2>
            <p className="text-sm text-zinc-400 max-w-md">
              Join golfers turning their passion into positive change. Every score, every month.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate({ to: '/register' })} icon={<ArrowRight size={16} />} className="shrink-0">
            Get started
          </Button>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-zinc-800/60 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GolfGivesLogo size={22} />
            <span className="text-xs text-zinc-600 font-medium">GolfGives</span>
          </div>
          <p className="text-xs text-zinc-700">© 2026 GolfGives. Golf. Draw. Impact.</p>
        </div>
      </footer>
    </div>
  )
}
