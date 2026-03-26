export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  subscription_status: SubscriptionStatus
  subscription_period: 'monthly' | 'yearly' | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_current_period_end: string | null
  charity_id: string | null
  charity_percentage: number
  is_admin: boolean
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  date: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url: string | null
  min_contribution: number
  is_featured: boolean
  total_raised: number
  created_at: string
}

export interface Draw {
  id: string
  draw_date: string
  winning_numbers: number[] | null
  status: 'upcoming' | 'simulated' | 'published'
  total_pool: number
  jackpot_rollover: number
  active_subscriber_count: number
  created_at: string
}

export interface Winner {
  id: string
  user_id: string
  draw_id: string
  tier: 3 | 4 | 5
  prize_amount: number
  proof_url: string | null
  status: 'pending' | 'verified' | 'paid'
  created_at: string
  profile?: Profile
  draw?: Draw
}

export interface PrizeTier {
  tier: 3 | 4 | 5
  label: string
  percentage: number
  amount: number
}

export type AuthUser = {
  id: string
  email: string
}
