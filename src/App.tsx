import { useState } from 'react'
import './App.css'
import { BoardPage } from './presentation/pages/BoardPage'
import { GuidePage } from './presentation/pages/GuidePage'
import { ReviewPage } from './presentation/pages/ReviewPage'
import { PokerPage } from './presentation/pages/PokerPage'
import { RetroPage } from './presentation/pages/RetroPage'
import { HistoryPage } from './presentation/pages/HistoryPage'

type Page = 'board' | 'guide' | 'review' | 'poker' | 'retro' | 'history'

const NAV_ITEMS: { page: Page; label: string; emoji: string }[] = [
  { page: 'board', label: 'ボード', emoji: '📋' },
  { page: 'guide', label: 'スクラムガイド', emoji: '📖' },
  { page: 'review', label: 'レビュー', emoji: '🔍' },
  { page: 'poker', label: '見積もり', emoji: '🃏' },
  { page: 'retro', label: 'レトロ', emoji: '🔄' },
  { page: 'history', label: '改善履歴', emoji: '📈' },
]

const PAGE_COMPONENTS: Record<Page, React.FC> = {
  board: BoardPage,
  guide: GuidePage,
  review: ReviewPage,
  poker: PokerPage,
  retro: RetroPage,
  history: HistoryPage,
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('board')

  const PageComponent = PAGE_COMPONENTS[currentPage]

  return (
    <div className="app">
      <header className="header">
        <h1 className="title" onClick={() => setCurrentPage('board')} style={{ cursor: 'pointer' }}>
          <span className="title-icon">⚡</span>
          Sprint Board
        </h1>
        <p className="subtitle">チームのタスクを可視化しよう</p>
      </header>

      <nav className="nav-bar">
        {NAV_ITEMS.map(item => (
          <button
            key={item.page}
            className={`nav-btn ${currentPage === item.page ? 'nav-active' : ''}`}
            onClick={() => setCurrentPage(item.page)}
          >
            <span>{item.emoji}</span> {item.label}
          </button>
        ))}
      </nav>

      <PageComponent />

      <footer className="footer">
        <p>Sprint Demo App v0.2.0</p>
      </footer>
    </div>
  )
}

export default App
