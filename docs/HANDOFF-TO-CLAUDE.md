# Handoff to Claude — ROOM v2 現状引き継ぎ

作成日: 2026-07-23（初版） / 更新日: 2026-08-31

**この文書は「これから作る」時点の内容ではありません。v2は実装済み・本番公開済みです。** 初版の内容（Phase 1着手前の調査記録）は末尾の「初版の記録（歴史的参考）」に残します。まずは以下の現状セクションを読んでください。

## 現状ひとことまとめ

ROOM公式サイトはAstroで実装済み、GitHub Pagesで本番公開中です。チケット販売は開始済み。残る作業は「ライブ接近に伴うコンテンツ追加」フェーズで、実装の土台は変わりません。

- 本番URL: <https://ryuik-on.github.io/ryu-ikon-room/>
- teketチケットURL: <https://teket.jp/19130/74082>（2026年8月22日に販売開始済み）
- 公演日: 2026年11月22日（日）那覇市ぶんかテンブス館 テンブスホール

## ブランチ構成

- `rebuild/room-v2` — Astroソース。**開発・編集は常にこのブランチで行う**
- `main` — ビルド済み静的出力のみ。GitHub Pagesの配信元（Deploy from a branch: main/root）。直接編集しない
- `archive/room-v1/`（`rebuild/room-v2`ブランチ内） — 旧サイトの退避先
- `room-v1-archive`タグ — 旧サイト公開時点の保全

デプロイ手順（`rebuild/room-v2`でビルド→`main`へrsync同期→push→GitHub Pagesビルド確認）の詳細と既知の落とし穴は、このセッションのプロジェクトメモリ`project-room-deploy-procedure`を参照してください（このリポジトリの外、Claude Codeのメモリシステムに保存済み）。要点だけ書くと:

1. `rebuild/room-v2`で`npm run build`
2. `dist/`を退避
3. `git checkout main`、退避先から`rsync -a --delete --exclude='.git' --exclude='README.md' --exclude='node_modules' --exclude='.astro'`で同期
4. commit・push
5. `gh api repos/ryuik-on/ryu-ikon-room/pages/builds/latest --jq '.status'`で`built`を確認（`building`で詰まったり`errored`になったら空コミットでリトライすると直ることが多い）
6. `rebuild/room-v2`に戻り`npm install`

## 技術構成（確定済み）

- Astro（静的サイト、フレームワーク依存最小）
- 単一ページ: `src/pages/index.astro`（マークアップ・データ・インラインCSS・JSをすべて含む）
- 画像は`astro:assets`の`<Image>`（`widths`/`sizes`/`loading`/`decoding`指定）
- フォント: 欧文はArchivo（可変フォント、SIL OFL、`public/fonts/`にセルフホスト）。日本語はシステムフォント
- JSON-LD `MusicEvent`構造化データ実装済み
- `public/.nojekyll`必須（GitHub PagesのデフォルトJekyll処理が`_astro/`を消す不具合の対策）

## 確定済みコンテンツ・運用ルール

`docs/facts-and-content.md`が確定情報の正本です。要約・改変せずそのまま参照してください。特に以下は決定済みで、蒸し返さないこと:

- コンセプト文・Founder's Note最終稿（2026-07-23改訂版）
- チケットCTAは常時クリック可能なリンク（`aria-disabled`等での事前抑止はしない、2026-07-25確定）
- 物販: タオル追加+¥1,200（2026-07-26確定、teket側で対応済み、サイトはTICKET欄に注記）
- 前売り文言は「より販売中です」（8/22の販売開始後を前提とした文言、2026-08-31修正）
- セットリスト（全曲目・演奏時間、6ブロック、総尺95分）は2026-08-31確定済み。**ただしサイトへの掲載はまだ未着手**。掲載粒度（ブロック名のみか曲目まで公開するか）は主催者に未確認 — `docs/open-questions.md`参照

## 素材の場所

生写真・OGP案・フライヤー案などは`~/Projects/ryu-ikon-room/materials/`にある（2026-08-31、`~/Documents/claude_room/`から移動、`.gitignore`で除外・Git非追跡）。サイトで実際に使っている画像は`src/assets/photos/`。

## 次にやること（優先順、詳細はプロジェクトメモリ`project-room-site-roadmap`参照）

1. セットリストのサイト掲載（内容は確定済み、掲載粒度の主催者確認待ち）
2. 当日の来場案内（整理券有無、開場〜開演の流れ、物販受け取り方法）
3. 出演バンド紹介
4. 完売・残席状況の告知動線

## Claudeが最初に読むファイル

1. `docs/facts-and-content.md`（確定情報の正本）
2. `docs/open-questions.md`（未確定事項の一覧）
3. `README.md`（ビルド・公開の運用手順）
4. `CLAUDE.md`

## 引き続き守ること

- `main`ブランチを直接編集しない（`rebuild/room-v2`でビルドしたものをrsyncで同期する以外の変更を加えない）
- コンテンツ（コピー、料金、日程等）の変更は主催者確認済みの`docs/facts-and-content.md`と矛盾しないか必ず照合する
- push・本番デプロイ・公開情報の変更は、実施前に人間に確認する
- 推測で情報を埋めない。未確認事項は`docs/open-questions.md`に残す

---

## 初版の記録（歴史的参考、2026-07-23時点）

以下はPhase 1着手前、Codexによる初回調査時点の記録です。現状とは大きく異なるため実行の参考にはしないでください（技術選定やブランチ起点などの経緯を確認したい場合のみ参照）。

### 当時の状態

- `rebuild/room-v2`の起点は`main`の`2b825ba377d566730f70e664e940d0a50ad9da66`
- v1は依存関係なしの静的HTML/CSS/JavaScript
- v2の技術は未決定（Astroは候補の一つに過ぎなかった）
- チケットURL、終演時刻、当日券、小人料金、公式サイトURル等すべて未確定

### 当時「まだ行ってはいけない」とされていたこと（すべて現在は完了済み）

完成デザイン・本実装・Astro導入・npm install・v2としてのmainへのmerge・Pages切替・本番deploy — これらはすべてその後の作業で完了し、現在は本番公開中です。この節は「かつて慎重さを求められていた」経緯の記録として残すのみで、現状のガードレールではありません。
