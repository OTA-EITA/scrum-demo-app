import { useState } from 'react'
import type { TaskPriority, TaskStatus } from '../../domain/task'
import { getPriorityColor, isOverdue } from '../../domain/task'
import { useTaskBoard } from '../../application/useTaskBoard'

const COLUMNS: { status: TaskStatus; title: string; emoji: string }[] = [
  { status: 'todo', title: 'To Do', emoji: '📋' },
  { status: 'doing', title: 'Doing', emoji: '🚀' },
  { status: 'done', title: 'Done', emoji: '✅' },
]

export function BoardPage() {
  const board = useTaskBoard()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set())
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const handleAddTask = () => {
    board.addTask(newTaskTitle, newTaskPriority, newTaskDueDate)
    setNewTaskTitle('')
    setNewTaskDueDate('')
  }

  const toggleSelect = (taskId: number) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const handleBulkMove = (status: TaskStatus) => {
    board.bulkMove(selectedTaskIds, status)
    setSelectedTaskIds(new Set())
  }

  const startEditing = (id: number, title: string) => {
    setEditingTaskId(id)
    setEditingTitle(title)
  }

  const saveEdit = () => {
    if (editingTaskId !== null && editingTitle.trim()) {
      board.editTitle(editingTaskId, editingTitle)
    }
    setEditingTaskId(null)
  }

  const handleDrop = (status: TaskStatus) => {
    if (draggedTaskId !== null) {
      board.moveTask(draggedTaskId, status)
      setDraggedTaskId(null)
    }
  }

  return (
    <>
      {board.taskHistory.length > 0 && (
        <div className="undo-bar">
          <button onClick={board.undo} className="undo-btn">↩ 元に戻す</button>
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
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="新しいタスクを追加..."
          className="task-input"
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
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
        <button onClick={handleAddTask} className="add-button" disabled={!newTaskTitle.trim()}>
          追加
        </button>
      </div>

      {selectedTaskIds.size > 0 && (
        <div className="bulk-action-bar">
          <span className="bulk-count">{selectedTaskIds.size}件選択中</span>
          <button className="bulk-btn bulk-todo" onClick={() => handleBulkMove('todo')}>📋 To Do</button>
          <button className="bulk-btn bulk-doing" onClick={() => handleBulkMove('doing')}>🚀 Doing</button>
          <button className="bulk-btn bulk-done" onClick={() => handleBulkMove('done')}>✅ Done</button>
          <button className="bulk-btn bulk-cancel" onClick={() => setSelectedTaskIds(new Set())}>✕ 解除</button>
        </div>
      )}

      <div className="board">
        {COLUMNS.map(column => (
          <div
            key={column.status}
            className="column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(column.status)}
          >
            <div className="column-header">
              <span className="column-emoji">{column.emoji}</span>
              <h2 className="column-title">{column.title}</h2>
              <span className="task-count">{board.getTasksByStatus(column.status).length}</span>
            </div>
            <div className="task-list">
              {board.getTasksByStatus(column.status).map(task => (
                <div
                  key={task.id}
                  className={`task-card ${draggedTaskId === task.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => setDraggedTaskId(task.id)}
                  onDragEnd={() => setDraggedTaskId(null)}
                >
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={selectedTaskIds.has(task.id)}
                    onChange={() => toggleSelect(task.id)}
                  />
                  <div
                    className="priority-indicator"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                    onClick={() => board.cyclePriority(task.id)}
                    title="クリックで優先度を変更"
                  />
                  <div className="task-content">
                    <span
                      className="assignee-badge"
                      onClick={() => board.setAssignee(task.id)}
                      title="クリックで担当者を変更"
                    >
                      👤 {task.assignee || '未割当'}
                    </span>
                    {task.dueDate && (
                      <span className={`due-date ${isOverdue(task) ? 'overdue' : ''}`}>
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
                      <p className="task-title" onDoubleClick={() => startEditing(task.id, task.title)}>{task.title}</p>
                    )}
                    {task.comment && (
                      <p className="task-comment">💬 {task.comment}</p>
                    )}
                    <div className="task-actions">
                      {column.status !== 'todo' && (
                        <button
                          className="action-btn back-btn"
                          onClick={() => board.moveTask(task.id, column.status === 'done' ? 'doing' : 'todo')}
                          title="前のステータスに戻す"
                        >
                          ←
                        </button>
                      )}
                      {column.status !== 'done' && (
                        <button
                          className="action-btn complete-btn"
                          onClick={() => board.moveTask(task.id, column.status === 'todo' ? 'doing' : 'done')}
                          title="次のステータスに移動"
                        >
                          →
                        </button>
                      )}
                      <button
                        className="action-btn comment-btn"
                        onClick={() => board.setComment(task.id)}
                        title="コメントを追加"
                      >
                        💬
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => board.deleteTask(task.id)}
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
  )
}
