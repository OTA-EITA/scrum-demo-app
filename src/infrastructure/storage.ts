const KEYS = {
  TASKS: 'sprint-board-tasks',
  FEEDBACKS: 'sprint-review-feedbacks',
  KPT: 'sprint-kpt',
} as const

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export const StorageKeys = KEYS
