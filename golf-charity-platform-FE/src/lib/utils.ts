import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateDrawNumbers(count = 5, max = 45): number[] {
  const numbers = new Set<number>()
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

export function countMatches(userNumbers: number[], winningNumbers: number[]): number {
  return userNumbers.filter((n) => winningNumbers.includes(n)).length
}

export function getTierFromMatches(matches: number): 3 | 4 | 5 | null {
  if (matches >= 5) return 5
  if (matches === 4) return 4
  if (matches === 3) return 3
  return null
}
