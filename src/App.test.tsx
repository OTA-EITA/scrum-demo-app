import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

describe('ナビゲーション', () => {
  it('初期表示はボードページ', () => {
    render(<App />)
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Doing')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('スクラムガイドページに遷移できる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('スクラムガイド'))
    expect(screen.getByText('📖 スクラムガイド')).toBeInTheDocument()
    expect(screen.getByText(/プロダクトオーナー/)).toBeInTheDocument()
  })

  it('レビューページに遷移できる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('レビュー'))
    expect(screen.getByText('🔍 スプリントレビュー フィードバック')).toBeInTheDocument()
  })

  it('見積もりページに遷移できる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('見積もり'))
    expect(screen.getByText('🃏 プランニングポーカー')).toBeInTheDocument()
  })

  it('レトロページに遷移できる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('レトロ'))
    expect(screen.getByText('🔄 レトロスペクティブ (KPT)')).toBeInTheDocument()
  })

  it('改善履歴ページに遷移できる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('改善履歴'))
    expect(screen.getByText('📈 改善履歴')).toBeInTheDocument()
  })

  it('タイトルクリックでボードに戻る', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('スクラムガイド'))
    expect(screen.queryByText('To Do')).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('Sprint Board'))
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })
})

describe('ボード - タスク操作', () => {
  it('タスクを追加できる', async () => {
    render(<App />)
    const input = screen.getByPlaceholderText('新しいタスクを追加...')
    await userEvent.type(input, 'テストタスク')
    await userEvent.click(screen.getByText('追加'))
    expect(screen.getByText('テストタスク')).toBeInTheDocument()
  })

  it('空文字ではタスクを追加できない', async () => {
    render(<App />)
    const addButton = screen.getByText('追加')
    expect(addButton).toBeDisabled()
  })

  it('タスクを削除できる（確認ダイアログ承認）', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    const deleteButtons = screen.getAllByTitle('タスクを削除')
    const taskTitle = 'バックログを整理する'
    expect(screen.getByText(taskTitle)).toBeInTheDocument()
    await userEvent.click(deleteButtons[deleteButtons.length - 1])
    expect(window.confirm).toHaveBeenCalled()
  })

  it('削除をキャンセルできる', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<App />)
    const initialCount = screen.getAllByTitle('タスクを削除').length
    await userEvent.click(screen.getAllByTitle('タスクを削除')[0])
    expect(screen.getAllByTitle('タスクを削除').length).toBe(initialCount)
  })

  it('タスクのステータスを移動できる', async () => {
    render(<App />)
    const moveButtons = screen.getAllByTitle('次のステータスに移動')
    await userEvent.click(moveButtons[0])
    // Task moved from todo to doing - count should change
    const todoColumn = screen.getByText('To Do').closest('.column') as HTMLElement
    const doingColumn = screen.getByText('Doing').closest('.column') as HTMLElement
    expect(within(todoColumn).getAllByTitle('タスクを削除').length).toBeLessThanOrEqual(
      within(doingColumn).getAllByTitle('タスクを削除').length
    )
  })

  it('優先度を選んでタスクを追加できる', async () => {
    render(<App />)
    const input = screen.getByPlaceholderText('新しいタスクを追加...')
    const select = screen.getByDisplayValue('Medium')
    await userEvent.selectOptions(select, 'high')
    await userEvent.type(input, '高優先度タスク')
    await userEvent.click(screen.getByText('追加'))
    expect(screen.getByText('高優先度タスク')).toBeInTheDocument()
  })

  it('localStorageに保存される', async () => {
    render(<App />)
    const input = screen.getByPlaceholderText('新しいタスクを追加...')
    await userEvent.type(input, '保存テスト')
    await userEvent.click(screen.getByText('追加'))
    const saved = JSON.parse(localStorage.getItem('sprint-board-tasks')!)
    expect(saved.some((t: { title: string }) => t.title === '保存テスト')).toBe(true)
  })
})

describe('レビュー - フィードバック', () => {
  it('フィードバックを追加できる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('レビュー'))

    await userEvent.type(screen.getByPlaceholderText('記載者名'), '太田')
    await userEvent.type(screen.getByPlaceholderText('フィードバック内容を入力...'), 'UIが良い')
    await userEvent.click(screen.getAllByText('追加')[0])

    expect(screen.getByText('太田')).toBeInTheDocument()
    expect(screen.getByText('UIが良い')).toBeInTheDocument()
  })

  it('記載者名が空だと追加できない', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('レビュー'))

    await userEvent.type(screen.getByPlaceholderText('フィードバック内容を入力...'), 'テスト')
    const addBtn = screen.getAllByText('追加')[0]
    expect(addBtn).toBeDisabled()
  })

  it('フィードバックを削除できる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('レビュー'))

    await userEvent.type(screen.getByPlaceholderText('記載者名'), '太田')
    await userEvent.type(screen.getByPlaceholderText('フィードバック内容を入力...'), '削除テスト')
    await userEvent.click(screen.getAllByText('追加')[0])

    expect(screen.getByText('削除テスト')).toBeInTheDocument()
    await userEvent.click(screen.getByTitle('削除'))
    expect(screen.queryByText('削除テスト')).not.toBeInTheDocument()
  })

  it('フィードバックがlocalStorageに保存される', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('レビュー'))

    await userEvent.type(screen.getByPlaceholderText('記載者名'), 'テスター')
    await userEvent.type(screen.getByPlaceholderText('フィードバック内容を入力...'), '保存確認')
    await userEvent.click(screen.getAllByText('追加')[0])

    const saved = JSON.parse(localStorage.getItem('sprint-review-feedbacks')!)
    expect(saved.some((f: { content: string }) => f.content === '保存確認')).toBe(true)
  })
})

describe('プランニングポーカー', () => {
  it('参加者を追加できる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('見積もり'))

    await userEvent.type(screen.getByPlaceholderText('参加者名を入力...'), 'Alice')
    await userEvent.click(screen.getByText('参加'))
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('同名の参加者は追加できない', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('見積もり'))

    await userEvent.type(screen.getByPlaceholderText('参加者名を入力...'), 'Alice')
    await userEvent.click(screen.getByText('参加'))
    await userEvent.type(screen.getByPlaceholderText('参加者名を入力...'), 'Alice')
    await userEvent.click(screen.getByText('参加'))

    expect(screen.getAllByText('Alice').length).toBe(1)
  })

  it('ポイントを選択して公開できる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('見積もり'))

    await userEvent.type(screen.getByPlaceholderText('参加者名を入力...'), 'Alice')
    await userEvent.click(screen.getByText('参加'))
    await userEvent.type(screen.getByPlaceholderText('参加者名を入力...'), 'Bob')
    await userEvent.click(screen.getByText('参加'))

    // Select points
    const playerCards = screen.getAllByText('5')
    await userEvent.click(playerCards[0])
    await userEvent.click(playerCards[1])

    await userEvent.click(screen.getByText('公開する'))
    expect(screen.getByText(/平均/)).toBeInTheDocument()
    expect(screen.getByText(/5\.0/)).toBeInTheDocument()
  })

  it('リセットで投票がクリアされる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('見積もり'))

    await userEvent.type(screen.getByPlaceholderText('参加者名を入力...'), 'Alice')
    await userEvent.click(screen.getByText('参加'))

    const fiveBtn = screen.getByText('5')
    await userEvent.click(fiveBtn)
    expect(screen.getByText('✓')).toBeInTheDocument()

    await userEvent.click(screen.getByText('リセット'))
    expect(screen.getByText('...')).toBeInTheDocument()
  })
})

describe('KPTレトロスペクティブ', () => {
  it('名前未入力だと入力欄が無効', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('レトロ'))

    const inputs = screen.getAllByPlaceholderText(/を追加/)
    inputs.forEach(input => expect(input).toBeDisabled())
  })

  it('Keep/Problem/Tryにアイテムを追加できる', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('レトロ'))

    await userEvent.type(screen.getByPlaceholderText('あなたの名前を入力...'), '太田')

    await userEvent.type(screen.getByPlaceholderText('Keepを追加...'), 'チーム連携が良い')
    await userEvent.click(screen.getAllByText('+')[0])
    expect(screen.getByText('チーム連携が良い')).toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText('Problemを追加...'), 'テスト不足')
    await userEvent.click(screen.getAllByText('+')[1])
    expect(screen.getByText('テスト不足')).toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText('Tryを追加...'), 'テスト自動化')
    await userEvent.click(screen.getAllByText('+')[2])
    expect(screen.getByText('テスト自動化')).toBeInTheDocument()
  })

  it('KPTデータがlocalStorageに保存される', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('レトロ'))

    await userEvent.type(screen.getByPlaceholderText('あなたの名前を入力...'), '太田')
    await userEvent.type(screen.getByPlaceholderText('Keepを追加...'), '保存テスト')
    await userEvent.click(screen.getAllByText('+')[0])

    const saved = JSON.parse(localStorage.getItem('sprint-kpt')!)
    expect(saved.keep.some((k: { text: string }) => k.text === '保存テスト')).toBe(true)
  })
})

describe('改善履歴', () => {
  it('Sprint 1とSprint 2の履歴が表示される', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('改善履歴'))

    expect(screen.getByText('Sprint 1')).toBeInTheDocument()
    expect(screen.getByText('Sprint 2')).toBeInTheDocument()
  })

  it('改善件数が正しく表示される', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('改善履歴'))

    expect(screen.getByText('改善件数: 4件')).toBeInTheDocument()
    expect(screen.getByText('改善件数: 11件')).toBeInTheDocument()
  })
})

describe('スクラムガイド', () => {
  it('ロール・イベント・成果物が全て表示される', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('スクラムガイド'))

    const headings = screen.getAllByRole('heading', { level: 3 })
    const headingTexts = headings.map(h => h.textContent)

    // Roles
    expect(headingTexts.some(t => t?.includes('プロダクトオーナー'))).toBe(true)
    expect(headingTexts.some(t => t?.includes('スクラムマスター'))).toBe(true)
    expect(headingTexts.some(t => t?.includes('開発チーム'))).toBe(true)

    // Events
    expect(headingTexts.some(t => t?.includes('スプリントプランニング'))).toBe(true)
    expect(headingTexts.some(t => t?.includes('デイリースクラム'))).toBe(true)
    expect(headingTexts.some(t => t?.includes('スプリントレビュー'))).toBe(true)
    expect(headingTexts.some(t => t?.includes('レトロスペクティブ'))).toBe(true)

    // Artifacts
    expect(headingTexts.some(t => t?.includes('プロダクトバックログ'))).toBe(true)
    expect(headingTexts.some(t => t?.includes('スプリントバックログ'))).toBe(true)
    expect(headingTexts.some(t => t?.includes('インクリメント'))).toBe(true)
  })
})
