import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          subscription_status: string
          subscription_period: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_current_period_end: string | null
          charity_id: string | null
          charity_percentage: number
          is_admin: boolean
          created_at: string
        }
      }
      scores: {
        Row: {
          id: string
          user_id: string
          score: number
          date: string
          created_at: string
        }
      }
      charities: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string | null
          min_contribution: number
          is_featured: boolean
          total_raised: number
          created_at: string
        }
      }
      draws: {
        Row: {
          id: string
          draw_date: string
          winning_numbers: number[] | null
          status: string
          total_pool: number
          jackpot_rollover: number
          active_subscriber_count: number
          created_at: string
        }
      }
      winners: {
        Row: {
          id: string
          user_id: string
          draw_id: string
          tier: number
          prize_amount: number
          proof_url: string | null
          status: string
          created_at: string
        }
      }
    }
  }
}
