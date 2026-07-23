# ROOM official website

音楽公演「ROOM」の公式Webサイトです。

## 現在の状態

- 公開中のv1は`main`の`2b825ba`および`room-v1-archive`で保全
- v2準備作業は`rebuild/room-v2`で実施
- v1のファイルはこのブランチの`archive/room-v1/`へ退避
- v2の本実装、フレームワーク導入、公開切替は未着手
- `room-v1-archive`タグと`rebuild/room-v2`ブランチはremoteへバックアップ済み

## 最初に読む資料

1. `docs/HANDOFF-TO-CLAUDE.md`
2. `docs/facts-and-content.md`
3. `docs/current-site-audit.md`
4. `docs/open-questions.md`
5. `docs/acceptance-criteria.md`
6. `CLAUDE.md`

v2では`archive/room-v1/`内の旧HTML/CSS/JavaScriptを流用しません。確定情報と`docs/content-architecture.md`の全体構成だけを引き継ぎます。

## v2の開発コマンド（Astro）

| コマンド | 内容 |
|---|---|
| `npm install` | 依存関係のインストール |
| `npm run dev` | 開発サーバー起動（`localhost:4321`） |
| `npm run build` | `./dist/`へ本番ビルド |
| `npm run preview` | ビルド結果をローカルでプレビュー |
| `npm run astro -- --help` | Astro CLIのヘルプ |

base pathは`/ryu-ikon-room/`（`astro.config.mjs`で設定）。
