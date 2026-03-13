export type FeedbackType = '感想' | '要望' | '改善' | 'バグ'

export const FEEDBACK_TYPES: FeedbackType[] = ['感想', '要望', '改善', 'バグ']

export interface Feedback {
  id: number
  author: string
  type: FeedbackType
  content: string
}

export function createFeedback(author: string, type: FeedbackType, content: string): Feedback {
  return {
    id: Date.now(),
    author: author.trim(),
    type,
    content: content.trim(),
  }
}

export function isValidFeedback(author: string, content: string): boolean {
  return author.trim().length > 0 && content.trim().length > 0
}
