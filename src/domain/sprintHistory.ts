export interface SprintHistory {
  sprint: number
  goal: string
  feedbacks: { issue: string; result: string }[]
}

export const SPRINT_HISTORIES: SprintHistory[] = [
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
