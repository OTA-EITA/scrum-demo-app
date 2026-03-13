export const POKER_POINTS = [1, 2, 3, 5, 8, 13] as const

export interface PokerVote {
  name: string
  point: number | null
}

export function createPokerVote(name: string): PokerVote {
  return { name: name.trim(), point: null }
}

export function setPoint(votes: PokerVote[], name: string, point: number): PokerVote[] {
  return votes.map(v => v.name === name ? { ...v, point } : v)
}

export function resetVotes(votes: PokerVote[]): PokerVote[] {
  return votes.map(v => ({ ...v, point: null }))
}

export function isDuplicatePlayer(votes: PokerVote[], name: string): boolean {
  return votes.some(v => v.name === name.trim())
}

export function hasAnyVote(votes: PokerVote[]): boolean {
  return votes.some(v => v.point !== null)
}

export function allVotesEmpty(votes: PokerVote[]): boolean {
  return votes.every(v => v.point === null)
}

export function calculateStats(votes: PokerVote[]): { avg: number; min: number; max: number } | null {
  const voted = votes.filter(v => v.point !== null).map(v => v.point!)
  if (voted.length === 0) return null
  return {
    avg: voted.reduce((s, p) => s + p, 0) / voted.length,
    min: Math.min(...voted),
    max: Math.max(...voted),
  }
}
