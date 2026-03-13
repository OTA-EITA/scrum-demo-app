export function GuidePage() {
  return (
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
  )
}
