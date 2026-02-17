import { useState, useEffect } from 'react'
import './App.css'

interface Task {
  id: number
  title: string
  status: 'todo' | 'doing' | 'done'
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  assignee?: string
  comment?: string
}

const initialTasks: Task[] = [
  { id: 1, title: 'スクラムの基礎を学ぶ', status: 'done', priority: 'high' },
  { id: 2, title: 'スプリント計画を立てる', status: 'doing', priority: 'high' },
  { id: 3, title: 'デイリースクラムに参加', status: 'todo', priority: 'medium' },
  { id: 4, title: 'バックログを整理する', status: 'todo', priority: 'low' },
  { id: 5, title: 'レトロスペクティブの準備', status: 'todo', priority: 'medium' },
]

function App() {
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

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">
          <span className="title-icon">⚡</span>
          Sprint Board
        </h1>
        <p className="subtitle">チームのタスクを可視化しよう</p>
      </header>

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
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
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

      <footer className="footer">
        <p>Sprint Demo App v0.1.0</p>
      </footer>
    </div>
  )
}

export default App
