import { useState, useEffect } from 'react'
import './App.css'

type Page = 'board' | 'guide' | 'review' | 'poker' | 'retro' | 'history'

interface Task {
  id: number
  title: string
  status: 'todo' | 'doing' | 'done'
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  assignee?: string
  comment?: string
}

interface Feedback {
  id: number
  author: string
  type: '感想' | '要望' | '改善' | 'バグ'
  content: string
}

interface KptItem {
  id: number
  author: string
  text: string
}

interface KptBoard {
  keep: KptItem[]
  problem: KptItem[]
  try: KptItem[]
}

interface PokerVote {
  name: string
  point: number | null
}

interface SprintHistory {
  sprint: number
  goal: string
  feedbacks: { issue: string; result: string }[]
}

const initialTasks: Task[] = [
  { id: 1, title: 'スクラムの基礎を学ぶ', status: 'done', priority: 'high' },
  { id: 2, title: 'スプリント計画を立てる', status: 'doing', priority: 'high' },
  { id: 3, title: 'デイリースクラムに参加', status: 'todo', priority: 'medium' },
  { id: 4, title: 'バックログを整理する', status: 'todo', priority: 'low' },
  { id: 5, title: 'レトロスペクティブの準備', status: 'todo', priority: 'medium' },
]

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('board')
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('sprint-board-tasks')
    return saved ? JSON.parse(saved) : initialTasks
  })
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set())
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [taskHistory, setTaskHistory] = useState<Task[][]>([])

  // Review feedback state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem('sprint-review-feedbacks')
    return saved ? JSON.parse(saved) : []
  })
  const [fbAuthor, setFbAuthor] = useState('')
  const [fbType, setFbType] = useState<Feedback['type']>('感想')
  const [fbContent, setFbContent] = useState('')

  // KPT state
  const [kpt, setKpt] = useState<KptBoard>(() => {
    const saved = localStorage.getItem('sprint-kpt')
    return saved ? JSON.parse(saved) : { keep: [], problem: [], try: [] }
  })
  const [kptAuthor, setKptAuthor] = useState('')
  const [kptTexts, setKptTexts] = useState({ keep: '', problem: '', try: '' })

  // Planning Poker state
  const [pokerVotes, setPokerVotes] = useState<PokerVote[]>([])
  const [pokerPlayerName, setPokerPlayerName] = useState('')
  const [pokerRevealed, setPokerRevealed] = useState(false)
  const [pokerTopic, setPokerTopic] = useState('')

  // Sprint History data
  const sprintHistories: SprintHistory[] = [
    {
      sprint: 1,
      goal: 'チームはタスク管理の基本機能を使えるようになる',
      feedbacks: [
        { issue: 'ドラッグ&ドロップでタスクを移動できる', result: '実装済み' },
        { issue: 'タスクの優先度を色で識別できる', result: '実装済み' },
        { issue: 'タスクを追加・削除できる', result: '実装済み' },
        { issue: '3カラムのカンバンボードで管理できる', result: '実装済み' },
      ],
    },
    {
      sprint: 2,
      goal: '参加者がスプリントレビューで改善点を発見できる状態にする',
      feedbacks: [
        { issue: '優先度の色の意味がわからない', result: '凡例を追加 (#25)' },
        { issue: '削除時に確認がない', result: '確認ダイアログ追加 (#1)' },
        { issue: 'ボタンの意味がわからない', result: 'ツールチップ追加 (#26)' },
        { issue: '空タスクが追加できる', result: 'バリデーション追加 (#4)' },
        { issue: 'リロードでデータ消失', result: 'localStorage保存 (#5)' },
        { issue: '優先度を変更したい', result: 'クリックで変更可能に (#3)' },
        { issue: 'タスク名を編集したい', result: 'ダブルクリック編集 (#6)' },
        { issue: '期限を入れたい', result: '期限設定機能追加 (#8)' },
        { issue: '担当者がほしい', result: '担当者アサイン追加 (#7)' },
        { issue: '元に戻したい', result: 'Undo機能追加 (#28)' },
        { issue: '一括移動したい', result: '一括移動機能追加 (#32)' },
      ],
    },
  ]

  useEffect(() => {
    localStorage.setItem('sprint-review-feedbacks', JSON.stringify(feedbacks))
  }, [feedbacks])

  useEffect(() => {
    localStorage.setItem('sprint-kpt', JSON.stringify(kpt))
  }, [kpt])

  const saveHistory = () => {
    setTaskHistory(prev => [...prev.slice(-19), tasks])
  }

  const undo = () => {
    if (taskHistory.length === 0) return
    const previous = taskHistory[taskHistory.length - 1]
    setTaskHistory(prev => prev.slice(0, -1))
    setTasks(previous)
  }

  useEffect(() => {
    localStorage.setItem('sprint-board-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTaskTitle.trim()) return
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      status: 'todo',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
    }
    setTasks([...tasks, newTask])
    setNewTaskTitle('')
    setNewTaskDueDate('')
  }

  const moveTask = (taskId: number, newStatus: Task['status']) => {
    saveHistory()
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id)
    setEditingTitle(task.title)
  }

  const saveEdit = () => {
    if (editingTaskId === null) return
    if (editingTitle.trim()) {
      setTasks(tasks.map(task =>
        task.id === editingTaskId ? { ...task, title: editingTitle.trim() } : task
      ))
    }
    setEditingTaskId(null)
  }

  const toggleSelectTask = (taskId: number) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const bulkMove = (newStatus: Task['status']) => {
    if (selectedTaskIds.size === 0) return
    saveHistory()
    setTasks(tasks.map(task =>
      selectedTaskIds.has(task.id) ? { ...task, status: newStatus } : task
    ))
    setSelectedTaskIds(new Set())
  }

  const setComment = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId)
    const comment = window.prompt('コメントを入力してください', task?.comment || '')
    if (comment === null) return
    saveHistory()
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, comment: comment || undefined } : t
    ))
  }

  const setAssignee = (taskId: number) => {
    const name = window.prompt('担当者名を入力してください')
    if (name === null) return
    saveHistory()
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, assignee: name || undefined } : task
    ))
  }

  const cyclePriority = (taskId: number) => {
    saveHistory()
    const order: Task['priority'][] = ['high', 'medium', 'low']
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task
      const nextIndex = (order.indexOf(task.priority) + 1) % order.length
      return { ...task, priority: order[nextIndex] }
    }))
  }

  const deleteTask = (taskId: number) => {
    if (!window.confirm('このタスクを削除しますか？')) return
    saveHistory()
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: Task['status']) => {
    if (draggedTask) {
      moveTask(draggedTask.id, status)
      setDraggedTask(null)
    }
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }

  const getTasksByStatus = (status: Task['status']) =>
    tasks
      .filter(task => task.status === status)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '#ff6b6b'
      case 'medium': return '#ffd93d'
      case 'low': return '#6bcb77'
    }
  }

  const columns: { status: Task['status']; title: string; emoji: string }[] = [
    { status: 'todo', title: 'To Do', emoji: '📋' },
    { status: 'doing', title: 'Doing', emoji: '🚀' },
    { status: 'done', title: 'Done', emoji: '✅' },
  ]

  const addFeedback = () => {
    if (!fbAuthor.trim() || !fbContent.trim()) return
    setFeedbacks([...feedbacks, { id: Date.now(), author: fbAuthor.trim(), type: fbType, content: fbContent.trim() }])
    setFbContent('')
  }

  const deleteFeedback = (id: number) => {
    setFeedbacks(feedbacks.filter(f => f.id !== id))
  }

  const addKptItem = (category: keyof KptBoard) => {
    const text = kptTexts[category].trim()
    if (!text || !kptAuthor.trim()) return
    setKpt({ ...kpt, [category]: [...kpt[category], { id: Date.now(), author: kptAuthor.trim(), text }] })
    setKptTexts({ ...kptTexts, [category]: '' })
  }

  const deleteKptItem = (category: keyof KptBoard, id: number) => {
    setKpt({ ...kpt, [category]: kpt[category].filter(item => item.id !== id) })
  }

  const addPokerPlayer = () => {
    if (!pokerPlayerName.trim()) return
    if (pokerVotes.find(v => v.name === pokerPlayerName.trim())) return
    setPokerVotes([...pokerVotes, { name: pokerPlayerName.trim(), point: null }])
    setPokerPlayerName('')
  }

  const setPokerPoint = (name: string, point: number) => {
    setPokerVotes(pokerVotes.map(v => v.name === name ? { ...v, point } : v))
  }

  const resetPoker = () => {
    setPokerVotes(pokerVotes.map(v => ({ ...v, point: null })))
    setPokerRevealed(false)
  }

  const navItems: { page: Page; label: string; emoji: string }[] = [
    { page: 'board', label: 'ボード', emoji: '📋' },
    { page: 'guide', label: 'スクラムガイド', emoji: '📖' },
    { page: 'review', label: 'レビュー', emoji: '🔍' },
    { page: 'poker', label: '見積もり', emoji: '🃏' },
    { page: 'retro', label: 'レトロ', emoji: '🔄' },
    { page: 'history', label: '改善履歴', emoji: '📈' },
  ]

  const pokerPoints = [1, 2, 3, 5, 8, 13]
  const fbTypes: Feedback['type'][] = ['感想', '要望', '改善', 'バグ']
  const kptCategories: { key: keyof KptBoard; label: string; color: string; emoji: string }[] = [
    { key: 'keep', label: 'Keep', color: '#6bcb77', emoji: '👍' },
    { key: 'problem', label: 'Problem', color: '#ff6b6b', emoji: '⚠️' },
    { key: 'try', label: 'Try', color: '#60a5fa', emoji: '💡' },
  ]

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
        {navItems.map(item => (
          <button
            key={item.page}
            className={`nav-btn ${currentPage === item.page ? 'nav-active' : ''}`}
            onClick={() => setCurrentPage(item.page)}
          >
            <span>{item.emoji}</span> {item.label}
          </button>
        ))}
      </nav>

      {/* ===== Board Page ===== */}
      {currentPage === 'board' && (
        <>
          {taskHistory.length > 0 && (
            <div className="undo-bar">
              <button onClick={undo} className="undo-btn">↩ 元に戻す</button>
            </div>
          )}

          <div className="priority-legend">
            <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#ff6b6b' }} />High</span>
            <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#ffd93d' }} />Medium</span>
            <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#6bcb77' }} />Low</span>
          </div>

          <div className="add-task-container">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="新しいタスクを追加..."
              className="task-input"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
              className="priority-select"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="date-input"
            />
            <button onClick={addTask} className="add-button" disabled={!newTaskTitle.trim()}>
              追加
            </button>
          </div>

          {selectedTaskIds.size > 0 && (
            <div className="bulk-action-bar">
              <span className="bulk-count">{selectedTaskIds.size}件選択中</span>
              <button className="bulk-btn bulk-todo" onClick={() => bulkMove('todo')}>📋 To Do</button>
              <button className="bulk-btn bulk-doing" onClick={() => bulkMove('doing')}>🚀 Doing</button>
              <button className="bulk-btn bulk-done" onClick={() => bulkMove('done')}>✅ Done</button>
              <button className="bulk-btn bulk-cancel" onClick={() => setSelectedTaskIds(new Set())}>✕ 解除</button>
            </div>
          )}

          <div className="board">
            {columns.map(column => (
              <div
                key={column.status}
                className="column"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.status)}
              >
                <div className="column-header">
                  <span className="column-emoji">{column.emoji}</span>
                  <h2 className="column-title">{column.title}</h2>
                  <span className="task-count">{getTasksByStatus(column.status).length}</span>
                </div>
                <div className="task-list">
                  {getTasksByStatus(column.status).map(task => (
                    <div
                      key={task.id}
                      className={`task-card ${draggedTask?.id === task.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={() => setDraggedTask(null)}
                    >
                      <input
                        type="checkbox"
                        className="task-checkbox"
                        checked={selectedTaskIds.has(task.id)}
                        onChange={() => toggleSelectTask(task.id)}
                      />
                      <div
                        className="priority-indicator"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                        onClick={() => cyclePriority(task.id)}
                        title="クリックで優先度を変更"
                      />
                      <div className="task-content">
                        <span
                          className="assignee-badge"
                          onClick={() => setAssignee(task.id)}
                          title="クリックで担当者を変更"
                        >
                          👤 {task.assignee || '未割当'}
                        </span>
                        {task.dueDate && (
                          <span className={`due-date ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'overdue' : ''}`}>
                            📅 {task.dueDate}
                          </span>
                        )}
                        {editingTaskId === task.id ? (
                          <input
                            className="edit-input"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingTaskId(null); }}
                            onBlur={saveEdit}
                            autoFocus
                          />
                        ) : (
                          <p className="task-title" onDoubleClick={() => startEditing(task)}>{task.title}</p>
                        )}
                        {task.comment && (
                          <p className="task-comment">💬 {task.comment}</p>
                        )}
                        <div className="task-actions">
                          {column.status !== 'todo' && (
                            <button
                              className="action-btn back-btn"
                              onClick={() => moveTask(task.id, column.status === 'done' ? 'doing' : 'todo')}
                              title="前のステータスに戻す"
                            >
                              ←
                            </button>
                          )}
                          {column.status !== 'done' && (
                            <button
                              className="action-btn complete-btn"
                              onClick={() => moveTask(task.id, column.status === 'todo' ? 'doing' : 'done')}
                              title="次のステータスに移動"
                            >
                              →
                            </button>
                          )}
                          <button
                            className="action-btn comment-btn"
                            onClick={() => setComment(task.id)}
                            title="コメントを追加"
                          >
                            💬
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteTask(task.id)}
                            title="タスクを削除"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== Scrum Guide Page ===== */}
      {currentPage === 'guide' && (
        <div className="page-content">
          <h2 className="page-title">📖 スクラムガイド</h2>
          <div className="guide-grid">
            <div className="guide-card">
              <h3>🔄 スプリント</h3>
              <p>1〜4週間の固定期間で、動くソフトウェア（インクリメント）を作成するサイクルです。スプリントはスクラムの心臓部であり、アイデアを価値に変える場です。</p>
            </div>
            <div className="guide-card">
              <h3>👑 プロダクトオーナー (PO)</h3>
              <p>プロダクトの価値を最大化する責任者。プロダクトバックログの管理、優先順位付け、ステークホルダーとの調整を行います。</p>
            </div>
            <div className="guide-card">
              <h3>🛡️ スクラムマスター (SM)</h3>
              <p>スクラムの理解と実践を支援するサーバントリーダー。チームの障害を取り除き、スクラムイベントのファシリテーションを行います。</p>
            </div>
            <div className="guide-card">
              <h3>👥 開発チーム</h3>
              <p>インクリメントを作成する自己管理型のチーム。クロスファンクショナルで、スプリントゴールの達成に必要な全てのスキルを持ちます。</p>
            </div>
            <div className="guide-section-title">スクラムイベント</div>
            <div className="guide-card event-card">
              <h3>📅 スプリントプランニング</h3>
              <p>スプリントの最初に行う計画会議。「何を作るか」と「どう作るか」を決め、スプリントゴールを設定します。</p>
            </div>
            <div className="guide-card event-card">
              <h3>☀️ デイリースクラム</h3>
              <p>毎日15分のミーティング。昨日やったこと、今日やること、障害を共有し、スプリントゴール達成に向けた計画を調整します。</p>
            </div>
            <div className="guide-card event-card">
              <h3>🔍 スプリントレビュー</h3>
              <p>スプリントの成果物をステークホルダーに披露し、フィードバックを収集します。プロダクトバックログを見直す場でもあります。</p>
            </div>
            <div className="guide-card event-card">
              <h3>🔄 レトロスペクティブ</h3>
              <p>チームの働き方を振り返る場。「何がうまくいったか」「何を改善すべきか」を議論し、次のスプリントの改善アクションを決めます。</p>
            </div>
            <div className="guide-section-title">スクラムの成果物</div>
            <div className="guide-card">
              <h3>📝 プロダクトバックログ</h3>
              <p>プロダクトに必要な全ての作業の優先順位付きリスト。POが管理し、常にリファインメントされます。</p>
            </div>
            <div className="guide-card">
              <h3>📋 スプリントバックログ</h3>
              <p>スプリントで取り組むバックログアイテムと、それを実現するための計画。開発チームが管理します。</p>
            </div>
            <div className="guide-card">
              <h3>📦 インクリメント</h3>
              <p>スプリントで完成した「動くソフトウェア」。完成の定義（DoD）を満たし、リリース可能な状態であること。</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Sprint Review Page ===== */}
      {currentPage === 'review' && (
        <div className="page-content">
          <h2 className="page-title">🔍 スプリントレビュー フィードバック</h2>
          <div className="review-form">
            <input
              type="text"
              value={fbAuthor}
              onChange={(e) => setFbAuthor(e.target.value)}
              placeholder="記載者名"
              className="task-input review-input"
            />
            <select
              value={fbType}
              onChange={(e) => setFbType(e.target.value as Feedback['type'])}
              className="priority-select"
            >
              {fbTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="text"
              value={fbContent}
              onChange={(e) => setFbContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFeedback()}
              placeholder="フィードバック内容を入力..."
              className="task-input review-content-input"
            />
            <button onClick={addFeedback} className="add-button" disabled={!fbAuthor.trim() || !fbContent.trim()}>
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
      )}

      {/* ===== Planning Poker Page ===== */}
      {currentPage === 'poker' && (
        <div className="page-content">
          <h2 className="page-title">🃏 プランニングポーカー</h2>
          <div className="poker-topic">
            <input
              type="text"
              value={pokerTopic}
              onChange={(e) => setPokerTopic(e.target.value)}
              placeholder="見積もり対象のストーリーを入力..."
              className="task-input poker-topic-input"
            />
          </div>
          <div className="poker-add-player">
            <input
              type="text"
              value={pokerPlayerName}
              onChange={(e) => setPokerPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPokerPlayer()}
              placeholder="参加者名を入力..."
              className="task-input"
            />
            <button onClick={addPokerPlayer} className="add-button" disabled={!pokerPlayerName.trim()}>
              参加
            </button>
          </div>
          {pokerVotes.length > 0 && (
            <>
              <div className="poker-players">
                {pokerVotes.map(vote => (
                  <div key={vote.name} className="poker-player-card">
                    <span className="poker-player-name">{vote.name}</span>
                    <div className="poker-cards">
                      {pokerPoints.map(p => (
                        <button
                          key={p}
                          className={`poker-card ${vote.point === p ? 'poker-card-selected' : ''}`}
                          onClick={() => !pokerRevealed && setPokerPoint(vote.name, p)}
                          disabled={pokerRevealed}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <div className="poker-vote-display">
                      {pokerRevealed ? (
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
                  onClick={() => setPokerRevealed(true)}
                  disabled={pokerRevealed || pokerVotes.every(v => v.point === null)}
                >
                  公開する
                </button>
                <button className="add-button poker-reset-btn" onClick={resetPoker}>
                  リセット
                </button>
              </div>
              {pokerRevealed && pokerVotes.some(v => v.point !== null) && (
                <div className="poker-result">
                  <span>平均: {(pokerVotes.filter(v => v.point !== null).reduce((s, v) => s + (v.point ?? 0), 0) / pokerVotes.filter(v => v.point !== null).length).toFixed(1)}</span>
                  <span>最小: {Math.min(...pokerVotes.filter(v => v.point !== null).map(v => v.point!))}</span>
                  <span>最大: {Math.max(...pokerVotes.filter(v => v.point !== null).map(v => v.point!))}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== KPT Retrospective Page ===== */}
      {currentPage === 'retro' && (
        <div className="page-content">
          <h2 className="page-title">🔄 レトロスペクティブ (KPT)</h2>
          <div className="kpt-author-bar">
            <input
              type="text"
              value={kptAuthor}
              onChange={(e) => setKptAuthor(e.target.value)}
              placeholder="あなたの名前を入力..."
              className="task-input"
            />
          </div>
          <div className="kpt-board">
            {kptCategories.map(cat => (
              <div key={cat.key} className="kpt-column" style={{ borderTopColor: cat.color }}>
                <h3 className="kpt-column-title" style={{ color: cat.color }}>
                  {cat.emoji} {cat.label}
                </h3>
                <div className="kpt-input-row">
                  <input
                    type="text"
                    value={kptTexts[cat.key]}
                    onChange={(e) => setKptTexts({ ...kptTexts, [cat.key]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addKptItem(cat.key)}
                    placeholder={`${cat.label}を追加...`}
                    className="task-input kpt-input"
                    disabled={!kptAuthor.trim()}
                  />
                  <button onClick={() => addKptItem(cat.key)} className="add-button kpt-add-btn" disabled={!kptTexts[cat.key].trim() || !kptAuthor.trim()}>+</button>
                </div>
                <div className="kpt-items">
                  {kpt[cat.key].map(item => (
                    <div key={item.id} className="kpt-sticky" style={{ borderLeftColor: cat.color }}>
                      <span className="kpt-sticky-author">{item.author}</span>
                      <span className="kpt-sticky-text">{item.text}</span>
                      <button className="kpt-delete" onClick={() => deleteKptItem(cat.key, item.id)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Sprint History Page ===== */}
      {currentPage === 'history' && (
        <div className="page-content">
          <h2 className="page-title">📈 改善履歴</h2>
          <div className="history-timeline">
            {sprintHistories.map(sh => (
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
      )}

      <footer className="footer">
        <p>Sprint Demo App v0.2.0</p>
      </footer>
    </div>
  )
}

export default App
