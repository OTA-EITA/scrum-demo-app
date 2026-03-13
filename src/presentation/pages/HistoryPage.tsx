import { SPRINT_HISTORIES } from '../../domain/sprintHistory'

export function HistoryPage() {
  return (
    <div className="page-content">
      <h2 className="page-title">📈 改善履歴</h2>
      <div className="history-timeline">
        {SPRINT_HISTORIES.map(sh => (
          <div key={sh.sprint} className="history-sprint">
            <h3 className="history-sprint-title">Sprint {sh.sprint}</h3>
            <p className="history-goal">🎯 {sh.goal}</p>
            <div className="history-items">
              {sh.feedbacks.map((fb, i) => (
                <div key={i} className="history-item">
                  <span className="history-before">📝 {fb.issue}</span>
                  <span className="history-arrow">→</span>
                  <span className="history-after">✅ {fb.result}</span>
                </div>
              ))}
            </div>
            <div className="history-summary">
              改善件数: {sh.feedbacks.length}件
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
