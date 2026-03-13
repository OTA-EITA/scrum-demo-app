export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'

export interface Task {
  id: number
  title: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  assignee?: string
  comment?: string
}

const STATUS_ORDER: TaskStatus[] = ['todo', 'doing', 'done']
const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }
const PRIORITY_CYCLE: TaskPriority[] = ['high', 'medium', 'low']
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#ff6b6b',
  medium: '#ffd93d',
  low: '#6bcb77',
}

export function createTask(title: string, priority: TaskPriority, dueDate?: string): Task {
  return {
    id: Date.now(),
    title,
    status: 'todo',
    priority,
    dueDate: dueDate || undefined,
  }
}

export function moveTaskForward(task: Task): Task {
  const idx = STATUS_ORDER.indexOf(task.status)
  if (idx >= STATUS_ORDER.length - 1) return task
  return { ...task, status: STATUS_ORDER[idx + 1] }
}

export function moveTaskBackward(task: Task): Task {
  const idx = STATUS_ORDER.indexOf(task.status)
  if (idx <= 0) return task
  return { ...task, status: STATUS_ORDER[idx - 1] }
}

export function changeTaskStatus(task: Task, status: TaskStatus): Task {
  return { ...task, status }
}

export function cyclePriority(task: Task): Task {
  const nextIndex = (PRIORITY_CYCLE.indexOf(task.priority) + 1) % PRIORITY_CYCLE.length
  return { ...task, priority: PRIORITY_CYCLE[nextIndex] }
}

export function updateTaskTitle(task: Task, title: string): Task {
  return { ...task, title }
}

export function updateTaskComment(task: Task, comment: string | undefined): Task {
  return { ...task, comment }
}

export function updateTaskAssignee(task: Task, assignee: string | undefined): Task {
  return { ...task, assignee }
}

export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
}

export function filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter(t => t.status === status)
}

export function getPriorityColor(priority: TaskPriority): string {
  return PRIORITY_COLORS[priority]
}

export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'done') return false
  return new Date(task.dueDate) < new Date()
}

export const initialTasks: Task[] = [
  { id: 1, title: 'スクラムの基礎を学ぶ', status: 'done', priority: 'high' },
  { id: 2, title: 'スプリント計画を立てる', status: 'doing', priority: 'high' },
  { id: 3, title: 'デイリースクラムに参加', status: 'todo', priority: 'medium' },
  { id: 4, title: 'バックログを整理する', status: 'todo', priority: 'low' },
  { id: 5, title: 'レトロスペクティブの準備', status: 'todo', priority: 'medium' },
]
