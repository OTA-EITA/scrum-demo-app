import { useState, useEffect } from 'react'
import './App.css'

interface Task {
  id: number
  title: string
  status: 'todo' | 'doing' | 'done'
  priority: 'high' | 'medium' | 'low'
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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

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
    }
    setTasks([...tasks, newTask])
    setNewTaskTitle('')
  }

  const moveTask = (taskId: number, newStatus: Task['status']) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const deleteTask = (taskId: number) => {
    if (!window.confirm('このタスクを削除しますか？')) return
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

  const getTasksByStatus = (status: Task['status']) =>
    tasks.filter(task => task.status === status)

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
        <button onClick={addTask} className="add-button" disabled={!newTaskTitle.trim()}>
          追加
        </button>
      </div>

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
                  className="task-card"
                  draggable
                  onDragStart={() => handleDragStart(task)}
                >
                  <div
                    className="priority-indicator"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  <div className="task-content">
                    <p className="task-title">{task.title}</p>
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
