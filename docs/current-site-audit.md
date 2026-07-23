# Current site audit

調査日: 2026-07-23（Asia/Tokyo）

対象: `main` / `2b825ba377d566730f70e664e940d0a50ad9da66`

公開URL: <https://ryuik-on.github.io/ryu-ikon-room/>

## 結論

旧サイトは依存関係やビルド工程を持たない、単一ページの静的HTML/CSS/JavaScriptサイトです。公開ページは調査時点で表示でき、ローカル`main`と同じコピー・導線・素材参照を持っていました。リポジトリ内にGitHub Actions、Pages用workflow、`CNAME`、`.nojekyll`はありません。公開URLとルート相対参照の動作から、GitHub Pagesのプロジェクトサイトとしてブランチのルートから配信されている可能性が高い一方、Pages設定画面は公開情報だけでは確認できないため、正確なsource branch/folderは要確認です。

v2では確定情報と全体構成だけを引き継ぎ、HTML/CSS/JavaScriptは流用しません。

## 技術構成

- HTML5: `index.html` 1ページ、210行
- CSS: `style.css` 792行、外部フレームワークなし
- JavaScript: `script.js` 469行、外部ライブラリなし
- Font: Google FontsのIBM Plex Sans JP（300/400/500）
- Hosting: GitHub PagesのプロジェクトURLで公開
- Build / lint / package manager: なし
- Analytics: 解析タグなし
- Data: HTML内のJSON-LD（`MusicEvent`）

## 元のファイル構成

```text
.
├── README.md
├── index.html
├── style.css
├── script.js
└── assets/
    ├── entrance-audience.jpg
    ├── entrance-light-gathering.jpg
    ├── hero-logo.png
    ├── light-transition.jpg
    ├── ogp.png
    ├── room-logo-rendered.png
    ├── room-logo-rendered.webp
    ├── room-logo.svg
    ├── visual01.jpg
    ├── visual02.jpg
    └── visual03.jpg
```

現在、旧実装は`archive/room-v1/`へ同じ構成で退避しています。元の状態は`room-v1-archive`タグから復元できます。

## ページ構成とセクション順

1. 固定TICKETリンク（Hero通過後に表示）
2. Hero — ロゴ、「琉球大学医学部軽音楽部」「立ち止まって、聴いてみる。」
3. Question — 「音楽に、何ができるだろうか。」
4. Statement — 「必死に音を鳴らせば、届くべき人に届く。そう信じています。」
5. Visual story × 3 — 写真と短いコピー
6. Founder’s Note
7. Room Entrance — ROOMへの遷移コピー
8. ROOM — 「ここから、はじまる。」
9. Ticket — 日時、会場、料金、teket導線、Instagram
10. Footer

## 主要機能

- スクロール進行に連動したテキスト・写真・光・Canvasパーティクル演出
- `prefers-reduced-motion: no-preference`を確認できた場合だけ動かすno-motion-first制御
- 低FPS時のmotion-liteへの自動切り替え
- 画面外ではCanvas描画を停止
- 固定チケットボタン
- Google Maps、teket、Instagramへの外部リンク
- OGP、Twitter card、canonical、favicon、MusicEvent JSON-LD
- 写真3点の遅延読み込み

## 良い点

- 公演日、開始時刻、会場、料金が1ページにまとまっている
- canonical、OGP、構造化データがすでに存在する
- サブパス配下で相対アセット参照が動作している
- 外部リンクに`noopener`と別タブで開く旨のaria-labelがある
- reduced motionを安全側に倒す方針とCanvas停止処理がある
- 主要写真にwidth/heightが指定され、レイアウトシフト軽減を意識している

## 問題点・技術的負債

### 高

- 現在のteket URL `https://teket.jp/19130/74082`は調査時に「イベントページ表示エラー」でした。固定ボタン、Ticketボタン、JSON-LDのOfferすべてが同じURLを使っています。新URLを推測してはいけません。
- JSON-LDの`endDate`（20:00）と画面の「終演目安 20:00頃」は、今回提供された確定情報に含まれません。公開前に主催者確認が必要です。

### 中

- 390px viewportで`scrollWidth`が413pxとなり23pxの横方向オーバーフローがあります。主因はROOMセクション内の`room-stage`/見出し周辺です。
- スクロール演出が長く、公開ページは390px幅で約14,677pxの高さになります。情報到達時間と操作負荷の検証が必要です。
- 主要な内容がJavaScript計算のCSS変数に強く依存し、スクロール位置・端末性能・viewport差の組合せが複雑です。
- 写真3点の`alt`が空です。装飾画像か内容画像かをv2で決め、内容画像なら説明が必要です。
- Google Fontsが外部依存です。読み込み失敗時はsystem-uiへフォールバックしますが、プライバシー・性能方針は未決定です。
- v1のREADMEは過去の修正メモ中心で、セットアップ、公開方式、復元手順を説明していませんでした。

### 低または不足

- `robots.txt`、`sitemap.xml`、専用`404.html`がありません。存在しないURLはGitHub Pages既定404でした。
- OGPはありますが、画像の内容・文字の安全域・SNS実表示は未検証です。
- faviconはHeroロゴPNGの流用で、専用サイズやSVG/ICO、Apple touch iconはありません。
- CSS/JSの自動lint、HTML検証、リンクチェック、視覚回帰テストがありません。
- 解析タグはありません。導入要否は未決定です。
- 公式サイトへの導線は現行ページ内にありません（Instagramのみ）。

## 再利用してよい情報

- 主催者が確認した公演名、主催、日程、OPEN/START、会場、料金
- 主催者が確認したコンセプト文、Founder’s Note、コピー
- セクションの全体構成
- 正式な権利・利用許諾が確認できた素材
- 正式な外部リンク
- canonical/OGP/構造化データに必要な事実

## 再利用してはいけない実装

- `archive/room-v1/index.html`
- `archive/room-v1/style.css`
- `archive/room-v1/script.js`
- 上記から抽出したコンポーネント、CSS値、Canvasロジック、アニメーション処理

v2は一から実装します。旧コードは挙動調査と復元だけに使用します。

## 素材一覧

| ファイル | サイズ | v1使用 | 説明（見た目・用途からの識別） |
|---|---:|---|---|
| `hero-logo.png` | 454×542 | 使用 | Heroロゴ兼favicon |
| `visual01.jpg` | 1567×1045 | 使用 | Visual story 1の公演写真 |
| `visual02.jpg` | 1152×864 | 使用 | Visual story 2の公演写真 |
| `visual03.jpg` | 1477×1108 | 使用 | Visual story 3の公演写真 |
| `ogp.png` | 1200×630 | 使用 | OGP画像 |
| `entrance-audience.jpg` | 1800×1400 | 未使用 | 入口・観客を想定した候補写真（正式説明要確認） |
| `entrance-light-gathering.jpg` | 1400×1000 | 未使用 | 光・会場を想定した候補写真（正式説明要確認） |
| `light-transition.jpg` | 1108×1477 | 未使用 | 遷移用候補写真（正式説明要確認） |
| `room-logo-rendered.png` | 2400×760 | 未使用 | ROOMロゴのPNG書き出し |
| `room-logo-rendered.webp` | 2400×760 | 未使用 | ROOMロゴのWebP書き出し |
| `room-logo.svg` | vector | 未使用 | ROOMロゴSVG |

ファイル名と使用箇所からの説明であり、撮影者、被写体、撮影日、権利、採用可否は確認できていません。

## 不足素材・情報

- v2 Heroに使用する正式な静止画または動画
- 写真の撮影者、利用許諾、クレジット、alt用説明
- 横長広告画像の所在
- ROOM専用ロゴの正式版と利用ルール
- 動画本体、poster画像、字幕または代替説明
- 公式サイトURL
- 有効なチケット販売URL
- 404/OGP/faviconのv2用成果物

## SEO・公開関連の現状

- OGP: あり（title/description/type/image/url/site_name）
- Twitter card: `summary_large_image`
- favicon: `assets/hero-logo.png`
- canonical: あり
- 404: 専用ファイルなし、GitHub Pages既定404
- robots.txt: なし
- sitemap: なし
- 構造化データ: MusicEventあり
- Analytics: なし
- base path: 相対参照により`/ryu-ikon-room/`で動作。OGP/canonicalは絶対URL
- Actions: `.github/workflows`なし
- Pages: 公開URLは稼働。正確なsource branch/folderはGitHub設定画面で要確認

## 壊れている参照・不要ファイル候補

- 壊れている参照: teket URL（調査時にエラーページ）
- 参照切れのローカルアセット: 検出なし
- 未使用素材候補: `entrance-audience.jpg`、`entrance-light-gathering.jpg`、`light-transition.jpg`、`room-logo-rendered.*`、`room-logo.svg`
- 削除判断: 今回は行わない。権利とv2採否を確認するまでarchiveで保全

## 調査上の制約

- GitHub Pages設定画面、リポジトリのSecrets、独自ドメイン設定は公開リポジトリのファイルからは確認できません。
- 外部サイトの状態は2026-07-23時点の確認結果です。公開前に再検証が必要です。
