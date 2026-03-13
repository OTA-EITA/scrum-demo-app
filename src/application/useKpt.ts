import { useState, useEffect } from 'react'
import type { KptBoard, KptCategory } from '../domain/kpt'
import { EMPTY_KPT_BOARD, createKptItem, addKptItem, removeKptItem } from '../domain/kpt'
import { loadFromStorage, saveToStorage, StorageKeys } from '../infrastructure/storage'

export function useKpt() {
  const [kpt, setKpt] = useState<KptBoard>(() =>
    loadFromStorage(StorageKeys.KPT, EMPTY_KPT_BOARD)
  )

  useEffect(() => {
    saveToStorage(StorageKeys.KPT, kpt)
  }, [kpt])

  const add = (category: KptCategory, author: string, text: string) => {
    if (!author.trim() || !text.trim()) return
    const item = createKptItem(author, text)
    setKpt(prev => addKptItem(prev, category, item))
  }

  const remove = (category: KptCategory, id: number) => {
    setKpt(prev => removeKptItem(prev, category, id))
  }

  return { kpt, addItem: add, removeItem: remove }
}
