# Handoff to Claude — ROOM v2 preparation

作成日: 2026-07-23

## 今回Codexが行った作業

- remote、branch、tag、working tree、公開URL、Pages関連ファイル、Actions、旧サイト構成を調査
- ライブサイトをデスクトップ相当1280pxとモバイル390pxで確認
- 外部チケット導線と404表示を確認
- `main`のHEADをローカルタグ`room-v1-archive`で保全
- `main`からローカルbranch`rebuild/room-v2`を作成
- v1の静的サイトを`archive/room-v1/`へ退避
- 事実、監査、情報構造、方向性、受け入れ条件、工程、未確定事項を文書化
- `CLAUDE.md`の下書きと本handoffを作成

新サイトのデザイン、本実装、フレームワーク導入、依存関係更新は行っていません。

## 現在のbranch

`rebuild/room-v2`

起点は`main`の`2b825ba377d566730f70e664e940d0a50ad9da66`です。`main`自体には変更を加えていません。

## 旧サイトの保存状態

- 公開時点のcommit: `2b825ba377d566730f70e664e940d0a50ad9da66`
- 保存タグ: `room-v1-archive`（ローカルのみ）
- branch内退避: `archive/room-v1/`
- `.git`、README、公開設定は移動していない
- リポジトリ内にActions/Pages設定ファイルは元から存在しない

復元・確認方法は`archive/room-v1/README.md`を参照してください。

## タグとbranchの状態

- remote branch: `origin/main`のみ
- local branch: `main`、`rebuild/room-v2`
- remote tag: なし（調査時）
- local tag: `room-v1-archive`
- push: 未実施

## 変更ファイル

### 退避

- `archive/room-v1/index.html`
- `archive/room-v1/style.css`
- `archive/room-v1/script.js`
- `archive/room-v1/assets/*`
- `archive/room-v1/README.md`

### 設計・監査

- `docs/current-site-audit.md`
- `docs/facts-and-content.md`
- `docs/content-architecture.md`
- `docs/visual-direction.md`
- `docs/acceptance-criteria.md`
- `docs/rebuild-plan.md`
- `docs/open-questions.md`
- `docs/screenshots/.gitkeep`
- `docs/HANDOFF-TO-CLAUDE.md`

### プロジェクト文書

- `CLAUDE.md`
- `README.md`
- `RESULTS.md`

## リポジトリの技術構成

v1は依存関係なしの静的HTML/CSS/JavaScriptです。Canvas、IntersectionObserver、requestAnimationFrame、CSS変数で長いスクロール演出を実装し、Google Fontsを読み込みます。build、lint、package.json、CIはありません。

v2の技術は未決定です。Astroは候補ですが確定ではありません。

## 重要な確定情報

- 公演名: ROOM
- 主催: Ryuik-on / 琉球大学医学部軽音楽部
- 日程: 2026年11月22日（日）
- OPEN: 16:00
- START: 17:00
- 会場: 那覇市ぶんかテンブス館 テンブスホール
- 料金: 学生1,000円 / 一般1,500円
- Instagram: <https://www.instagram.com/ryuikeion/>
- ROOMサイト: <https://ryuik-on.github.io/ryu-ikon-room/>
- コンセプト原文: `docs/facts-and-content.md`参照（要約禁止）

## 未確定情報・検出した問題

- v1のteket URLは2026-07-23時点でイベントページ表示エラー
- 有効なチケットURL、販売期間、当日券方針
- 小人料金の有無
- v1にある「終演目安20:00頃」とJSON-LDの20:00固定値
- Founder’s Note最終稿とコンセプト原文との役割分担
- 公式サイトURL
- Heroの静止画/動画、採用素材、横長広告画像
- 素材の撮影者、権利、クレジット、被写体許諾
- ROOM専用ロゴ、フォント、解析、公開切替時期
- GitHub Pages設定の正確なsource branch/folder
- 390pxで23pxの既存横オーバーフロー

## Claudeが最初に読むファイル

1. `docs/facts-and-content.md`
2. `docs/open-questions.md`
3. `docs/current-site-audit.md`
4. `docs/content-architecture.md`
5. `docs/visual-direction.md`
6. `docs/acceptance-criteria.md`
7. `docs/rebuild-plan.md`
8. `CLAUDE.md`

## Claudeが最初に行うべき調査

1. `facts-and-content.md`の確定/未確定区分を人間と確認する
2. 特にチケットURL、終演時刻、当日券、小人料金、Founder’s Note、公式サイトURLを解決する
3. 素材の内容・権利・クレジット・採否を確認する
4. GitHub Pages設定画面でsource branch/folderと公開運用を確認する
5. v2技術候補を、GitHub Pages base path・保守性・依存関係・運用コストで比較する
6. 技術導入前にPhase 1の完了条件と受け入れ条件を確定する

## Claudeがまだ行ってはいけないこと

- 完成デザイン、Heroデザイン、本実装
- Astro/React/Next.js等の導入、`npm install`、依存関係更新
- v1コードの流用・改善
- 素材の生成・削除・圧縮
- 未確認情報や推測URLの追加
- mainへのmerge、Pages切替、本番deploy
- remote push（人間承認まで）
- タグ上書き、force push、履歴改変

## 推奨する次のプロンプト

```text
ROOM v2のPhase 1（コンセプトと要件の確定）だけを計画してください。

最初に次を順番に読んでください。
- docs/facts-and-content.md
- docs/open-questions.md
- docs/current-site-audit.md
- docs/content-architecture.md
- docs/visual-direction.md
- docs/acceptance-criteria.md
- docs/rebuild-plan.md
- CLAUDE.md

確定事実・v1から抽出した文章・未確定事項・提案を混同しないでください。
特に、壊れているteket URLの代替、小人料金、終演時刻、当日券、公式サイトURLを推測しないでください。

今回は実装、デザイン作成、依存関係導入、素材変更、pushを行わず、以下だけを提示してください。
1. Phase 1で人間が回答すべき質問（優先順）
2. 各回答が後続Phaseへ与える影響
3. 技術選定へ進む前の完了条件
4. 更新が必要になるdocsファイルと変更計画
```

## 実行すべき確認コマンド

```sh
git status --short --branch
git branch -a -vv
git tag -n
git rev-parse main
git rev-list -n 1 room-v1-archive
git log --oneline --decorate -5
git diff main...rebuild/room-v2 --stat
git ls-tree -r --name-only room-v1-archive
find archive/room-v1 -type f -not -name README.md -print | sort
find docs -maxdepth 2 -type f -print | sort
```

v2のbuild/lintコマンドは未定義です。存在しないコマンドを実行前提にしないでください。

## remoteへpushされていない変更

次はすべてローカルのみです。

- `room-v1-archive`タグ
- `rebuild/room-v2`branch
- 退避、docs、CLAUDE.md、README.md、RESULTS.mdのcommit

remoteへ送る場合も、まず人間が差分を確認し、明示承認してから行ってください。
