import type { Draw, PrizeTier } from '@/types'
import { generateDrawNumbers, countMatches, getTierFromMatches } from './utils'

export const SUBSCRIPTION_FEE_MONTHLY = 10
export const SUBSCRIPTION_FEE_YEARLY = 100
export const CHARITY_MIN_PERCENT = 10
export const PLATFORM_FEE_PERCENT = 5

export const PRIZE_SPLIT = {
  5: 0.40,
  4: 0.35,
  3: 0.25,
} as const

export function calculatePrizePool(
  _activeSubscribers: number,
  monthlyRevenue: number,
  charityPercent: number,
  jackpotRollover: number,
): { total: number; charityPool: number; prizePool: number } {
  const total = monthlyRevenue
  const platformFee = total * (PLATFORM_FEE_PERCENT / 100)
  const charityPool = total * (charityPercent / 100)
  const prizePool = total - platformFee - charityPool + jackpotRollover

  return { total, charityPool, prizePool: Math.max(0, prizePool) }
}

export function computeTierAmounts(prizePool: number): PrizeTier[] {
  return [
    {
      tier: 5,
      label: '5-Number Match (Jackpot)',
      percentage: 40,
      amount: prizePool * PRIZE_SPLIT[5],
    },
    {
      tier: 4,
      label: '4-Number Match',
      percentage: 35,
      amount: prizePool * PRIZE_SPLIT[4],
    },
    {
      tier: 3,
      label: '3-Number Match',
      percentage: 25,
      amount: prizePool * PRIZE_SPLIT[3],
    },
  ]
}

export function simulateDraw(draw: Partial<Draw>): {
  winningNumbers: number[]
  drawDate: string
} {
  return {
    winningNumbers: generateDrawNumbers(5, 45),
    drawDate: draw.draw_date ?? new Date().toISOString(),
  }
}

export function evaluateTickets(
  tickets: { userId: string; numbers: number[] }[],
  winningNumbers: number[],
): { userId: string; tier: 3 | 4 | 5 | null; matches: number }[] {
  return tickets.map(({ userId, numbers }) => {
    const matches = countMatches(numbers, winningNumbers)
    const tier = getTierFromMatches(matches)
    return { userId, tier, matches }
  })
}

export function calculateWinnerPrize(
  tier: 3 | 4 | 5,
  winnersAtTier: number,
  prizePool: number,
): number {
  if (winnersAtTier === 0) return 0
  const tierPool = prizePool * PRIZE_SPLIT[tier]
  return tierPool / winnersAtTier
}

export function shouldRolloverJackpot(tier5Winners: number): boolean {
  return tier5Winners === 0
}
