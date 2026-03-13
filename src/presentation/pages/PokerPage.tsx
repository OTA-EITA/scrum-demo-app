import { useState } from 'react'
import { POKER_POINTS } from '../../domain/poker'
import { usePoker } from '../../application/usePoker'

export function PokerPage() {
  const poker = usePoker()
  const [playerName, setPlayerName] = useState('')

  const handleAddPlayer = () => {
    poker.addPlayer(playerName)
    setPlayerName('')
  }

  return (
    <div className="page-content">
      <h2 className="page-title">🃏 プランニングポーカー</h2>
      <div className="poker-topic">
        <input
          type="text"
          value={poker.topic}
          onChange={(e) => poker.setTopic(e.target.value)}
          placeholder="見積もり対象のストーリーを入力..."
          className="task-input poker-topic-input"
        />
      </div>
      <div className="poker-add-player">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
          placeholder="参加者名を入力..."
          className="task-input"
        />
        <button onClick={handleAddPlayer} className="add-button" disabled={!playerName.trim()}>
          参加
        </button>
      </div>
      {poker.votes.length > 0 && (
        <>
          <div className="poker-players">
            {poker.votes.map(vote => (
              <div key={vote.name} className="poker-player-card">
                <span className="poker-player-name">{vote.name}</span>
                <div className="poker-cards">
                  {POKER_POINTS.map(p => (
                    <button
                      key={p}
                      className={`poker-card ${vote.point === p ? 'poker-card-selected' : ''}`}
                      onClick={() => poker.vote(vote.name, p)}
                      disabled={poker.revealed}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="poker-vote-display">
                  {poker.revealed ? (
                    <span className="poker-revealed-point">{vote.point ?? '?'}</span>
                  ) : (
                    <span className="poker-hidden">{vote.point !== null ? '✓' : '...'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="poker-actions">
            <button
              className="add-button"
              onClick={poker.reveal}
              disabled={poker.revealed || poker.votes.every(v => v.point === null)}
            >
              公開する
            </button>
            <button className="add-button poker-reset-btn" onClick={poker.reset}>
              リセット
            </button>
          </div>
          {poker.stats && (
            <div className="poker-result">
              <span>平均: {poker.stats.avg.toFixed(1)}</span>
              <span>最小: {poker.stats.min}</span>
              <span>最大: {poker.stats.max}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
