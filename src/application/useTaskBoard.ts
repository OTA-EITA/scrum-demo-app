import { useState, useEffect } from 'react'
import type { Task, TaskPriority, TaskStatus } from '../domain/task'
import {
  createTask, changeTaskStatus, cyclePriority as cyclePriorityDomain,
  updateTaskTitle, updateTaskComment, updateTaskAssignee,
  filterByStatus, sortByPriority, initialTasks,
} from '../domain/task'
import { loadFromStorage, saveToStorage, StorageKeys } from '../infrastructure/storage'

export function useTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage(StorageKeys.TASKS, initialTasks)
  )
  const [taskHistory, setTaskHistory] = useState<Task[][]>([])

  useEffect(() => {
    saveToStorage(StorageKeys.TASKS, tasks)
  }, [tasks])

  const saveHistory = () => {
    setTaskHistory(prev => [...prev.slice(-19), tasks])
  }

  const addTask = (title: string, priority: TaskPriority, dueDate: string) => {
    if (!title.trim()) return
    setTasks(prev => [...prev, createTask(title, priority, dueDate)])
  }

  const deleteTask = (taskId: number) => {
    if (!window.confirm('このタスクを削除しますか？')) return
    saveHistory()
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const moveTask = (taskId: number, newStatus: TaskStatus) => {
    saveHistory()
    setTasks(prev => prev.map(t =>
      t.id === taskId ? changeTaskStatus(t, newStatus) : t
    ))
  }

  const bulkMove = (taskIds: Set<number>, newStatus: TaskStatus) => {
    if (taskIds.size === 0) return
    saveHistory()
    setTasks(prev => prev.map(t =>
      taskIds.has(t.id) ? changeTaskStatus(t, newStatus) : t
    ))
  }

  const cyclePriority = (taskId: number) => {
    saveHistory()
    setTasks(prev => prev.map(t =>
      t.id === taskId ? cyclePriorityDomain(t) : t
    ))
  }

  const editTitle = (taskId: number, title: string) => {
    if (!title.trim()) return
    setTasks(prev => prev.map(t =>
      t.id === taskId ? updateTaskTitle(t, title.trim()) : t
    ))
  }

  const setComment = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId)
    const comment = window.prompt('コメントを入力してください', task?.comment || '')
    if (comment === null) return
    saveHistory()
    setTasks(prev => prev.map(t =>
      t.id === taskId ? updateTaskComment(t, comment || undefined) : t
    ))
  }

  const setAssignee = (taskId: number) => {
    const name = window.prompt('担当者名を入力してください')
    if (name === null) return
    saveHistory()
    setTasks(prev => prev.map(t =>
      t.id === taskId ? updateTaskAssignee(t, name || undefined) : t
    ))
  }

  const undo = () => {
    if (taskHistory.length === 0) return
    const previous = taskHistory[taskHistory.length - 1]
    setTaskHistory(prev => prev.slice(0, -1))
    setTasks(previous)
  }

  const getTasksByStatus = (status: TaskStatus) =>
    sortByPriority(filterByStatus(tasks, status))

  return {
    tasks,
    taskHistory,
    addTask,
    deleteTask,
    moveTask,
    bulkMove,
    cyclePriority,
    editTitle,
    setComment,
    setAssignee,
    undo,
    getTasksByStatus,
  }
}
