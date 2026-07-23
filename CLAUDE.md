# CLAUDE.md — draft for ROOM v2

## Project purpose

音楽公演「ROOM」の公式Webサイトを、現在公開中のv1を保全したまま一から再構築する。

## Source of truth

作業前に次を読む。

1. `docs/facts-and-content.md`
2. `docs/content-architecture.md`
3. `docs/visual-direction.md`
4. `docs/acceptance-criteria.md`
5. `docs/rebuild-plan.md`
6. `docs/open-questions.md`
7. `docs/current-site-audit.md`

事実は`facts-and-content.md`を基準にする。不一致がある場合は統合せず、`open-questions.md`へ記録して人間へ確認する。

## Non-negotiable rules

- v2は一から再構築する
- `archive/room-v1/`内のHTML/CSS/JavaScript、コンポーネント、スタイル値、アニメーション処理を流用しない
- v1から引き継ぐのは、確認済み事実、承認済み原稿、全体構成、権利確認済み素材だけ
- 未確認情報を推測・追加しない
- チケットURL、料金区分、終演時刻、出演者等を推測しない
- `main`を直接変更せず、公開サイトを壊さない
- remoteへのpush、mainへのmerge、Pages切替、本番公開は人間の明示承認まで行わない
- 既存タグを上書きせず、force pushや履歴改変を行わない
- 秘密情報、認証情報、トークンをコミットしない

## Working method

- 実装前に対象セクション、変更ファイル、確認方法を含む変更計画を提示する
- 一度にサイト全体を完成させない
- `docs/rebuild-plan.md`のPhaseとセクション単位で進める
- 各段階でモバイル、タブレット、デスクトップのスクリーンショットを確認し、`docs/screenshots/`へ記録する
- モバイルを先に成立させてから広い画面へ展開する
- 写真、映像、余白を主役にし、説明より先に体験を置く
- 見た目や演出は`docs/visual-direction.md`の議論前提に沿い、人間の承認前に確定扱いしない
- テンプレート感が出た場合は、ROOMのコンセプトと採用素材に根拠があるか見直す

## Quality requirements

- GitHub Pagesの`/ryu-ikon-room/`base pathを考慮する
- `prefers-reduced-motion`に対応し、動きなしでも情報と導線を利用可能にする
- キーボード操作、フォーカス、コントラスト、見出し、altを確認する
- 画像を用途に合わせて最適化し、動画にはフォールバックを用意する
- OGP、favicon、canonical、robots、sitemap、404、構造化データを公開前に確認する
- 内部リンク・外部リンクを確認する
- 採用した技術に応じたbuildとlintを実行する
- コマンドが存在することを確認してから実行・文書化する

## Technology status

現時点でv2のフレームワーク、パッケージ管理、build/lintコマンドは未決定。Astroは候補の一つであり、決定事項ではない。依存関係を追加する前に比較案と変更計画を提示し、人間の承認を得る。

## Archive

- 保存タグ: `room-v1-archive`
- v1コード: `archive/room-v1/`
- archiveは挙動調査と復元に限って参照する
- v1の問題をarchive内で修正しない

## Approval gates

次は人間の承認が必要。

- scope/構成の変更
- 技術選定と依存関係導入
- 素材・原稿・チケットURLの公開確定
- データや素材の削除
- 外部への連絡
- 有料操作
- remote push、merge、Pages設定変更、本番公開
