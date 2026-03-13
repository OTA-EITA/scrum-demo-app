import { useState } from 'react'
import type { PokerVote } from '../domain/poker'
import {
  createPokerVote, setPoint, resetVotes,
  isDuplicatePlayer, calculateStats, allVotesEmpty,
} from '../domain/poker'

export function usePoker() {
  const [votes, setVotes] = useState<PokerVote[]>([])
  const [revealed, setRevealed] = useState(false)
  const [topic, setTopic] = useState('')

  const addPlayer = (name: string) => {
    if (!name.trim() || isDuplicatePlayer(votes, name)) return
    setVotes(prev => [...prev, createPokerVote(name)])
  }

  const vote = (name: string, point: number) => {
    if (revealed) return
    setVotes(prev => setPoint(prev, name, point))
  }

  const reveal = () => {
    if (allVotesEmpty(votes)) return
    setRevealed(true)
  }

  const reset = () => {
    setVotes(prev => resetVotes(prev))
    setRevealed(false)
  }

  const stats = revealed ? calculateStats(votes) : null

  return {
    votes,
    revealed,
    topic,
    setTopic,
    addPlayer,
    vote,
    reveal,
    reset,
    stats,
  }
}
