export type KptCategory = 'keep' | 'problem' | 'try'

export interface KptItem {
  id: number
  author: string
  text: string
}

export interface KptBoard {
  keep: KptItem[]
  problem: KptItem[]
  try: KptItem[]
}

export const EMPTY_KPT_BOARD: KptBoard = { keep: [], problem: [], try: [] }

export const KPT_CATEGORIES: { key: KptCategory; label: string; color: string; emoji: string }[] = [
  { key: 'keep', label: 'Keep', color: '#6bcb77', emoji: '👍' },
  { key: 'problem', label: 'Problem', color: '#ff6b6b', emoji: '⚠️' },
  { key: 'try', label: 'Try', color: '#60a5fa', emoji: '💡' },
]

export function createKptItem(author: string, text: string): KptItem {
  return { id: Date.now(), author: author.trim(), text: text.trim() }
}

export function addKptItem(board: KptBoard, category: KptCategory, item: KptItem): KptBoard {
  return { ...board, [category]: [...board[category], item] }
}

export function removeKptItem(board: KptBoard, category: KptCategory, id: number): KptBoard {
  return { ...board, [category]: board[category].filter(item => item.id !== id) }
}

export function isValidKptInput(author: string, text: string): boolean {
  return author.trim().length > 0 && text.trim().length > 0
}
