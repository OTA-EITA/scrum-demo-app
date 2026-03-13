import { useState } from 'react'
import type { FeedbackType } from '../../domain/feedback'
import { FEEDBACK_TYPES, isValidFeedback } from '../../domain/feedback'
import { useFeedback } from '../../application/useFeedback'

export function ReviewPage() {
  const { feedbacks, addFeedback, deleteFeedback } = useFeedback()
  const [author, setAuthor] = useState('')
  const [type, setType] = useState<FeedbackType>('感想')
  const [content, setContent] = useState('')

  const handleAdd = () => {
    addFeedback(author, type, content)
    setContent('')
  }

  return (
    <div className="page-content">
      <h2 className="page-title">🔍 スプリントレビュー フィードバック</h2>
      <div className="review-form">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="記載者名"
          className="task-input review-input"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as FeedbackType)}
          className="priority-select"
        >
          {FEEDBACK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="フィードバック内容を入力..."
          className="task-input review-content-input"
        />
        <button onClick={handleAdd} className="add-button" disabled={!isValidFeedback(author, content)}>
          追加
        </button>
      </div>
      <div className="feedback-list">
        {feedbacks.length === 0 && <p className="empty-message">フィードバックがまだありません。上のフォームから追加してください。</p>}
        {feedbacks.map(fb => (
          <div key={fb.id} className="feedback-card">
            <span className={`fb-type fb-type-${fb.type}`}>{fb.type}</span>
            <span className="fb-author">{fb.author}</span>
            <span className="fb-content">{fb.content}</span>
            <button className="action-btn delete-btn" onClick={() => deleteFeedback(fb.id)} title="削除">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
