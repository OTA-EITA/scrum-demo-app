import { useState, useEffect } from 'react'
import type { Feedback, FeedbackType } from '../domain/feedback'
import { createFeedback } from '../domain/feedback'
import { loadFromStorage, saveToStorage, StorageKeys } from '../infrastructure/storage'

export function useFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() =>
    loadFromStorage(StorageKeys.FEEDBACKS, [])
  )

  useEffect(() => {
    saveToStorage(StorageKeys.FEEDBACKS, feedbacks)
  }, [feedbacks])

  const addFeedback = (author: string, type: FeedbackType, content: string) => {
    if (!author.trim() || !content.trim()) return
    setFeedbacks(prev => [...prev, createFeedback(author, type, content)])
  }

  const deleteFeedback = (id: number) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id))
  }

  return { feedbacks, addFeedback, deleteFeedback }
}
