import { useState } from 'react'
import type { KptCategory } from '../../domain/kpt'
import { KPT_CATEGORIES, isValidKptInput } from '../../domain/kpt'
import { useKpt } from '../../application/useKpt'

export function RetroPage() {
  const { kpt, addItem, removeItem } = useKpt()
  const [author, setAuthor] = useState('')
  const [texts, setTexts] = useState({ keep: '', problem: '', try: '' })

  const handleAdd = (category: KptCategory) => {
    addItem(category, author, texts[category])
    setTexts(prev => ({ ...prev, [category]: '' }))
  }

  return (
    <div className="page-content">
      <h2 className="page-title">🔄 レトロスペクティブ (KPT)</h2>
      <div className="kpt-author-bar">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="あなたの名前を入力..."
          className="task-input"
        />
      </div>
      <div className="kpt-board">
        {KPT_CATEGORIES.map(cat => (
          <div key={cat.key} className="kpt-column" style={{ borderTopColor: cat.color }}>
            <h3 className="kpt-column-title" style={{ color: cat.color }}>
              {cat.emoji} {cat.label}
            </h3>
            <div className="kpt-input-row">
              <input
                type="text"
                value={texts[cat.key]}
                onChange={(e) => setTexts(prev => ({ ...prev, [cat.key]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd(cat.key)}
                placeholder={`${cat.label}を追加...`}
                className="task-input kpt-input"
                disabled={!author.trim()}
              />
              <button
                onClick={() => handleAdd(cat.key)}
                className="add-button kpt-add-btn"
                disabled={!isValidKptInput(author, texts[cat.key])}
              >
                +
              </button>
            </div>
            <div className="kpt-items">
              {kpt[cat.key].map(item => (
                <div key={item.id} className="kpt-sticky" style={{ borderLeftColor: cat.color }}>
                  <span className="kpt-sticky-author">{item.author}</span>
                  <span className="kpt-sticky-text">{item.text}</span>
                  <button className="kpt-delete" onClick={() => removeItem(cat.key, item.id)}>×</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
