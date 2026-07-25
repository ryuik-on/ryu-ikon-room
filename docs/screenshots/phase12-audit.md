# Phase 12 — 公開前監査記録

確認日: 2026-07-25（Asia/Tokyo）
対象: `rebuild/room-v2` HEAD（コミット `8c8c610`まで）、`npm run build`成果物（`dist/`）

## build / lint

- `npm run build` 成功（エラー・警告なし）
- lint: `astro check`は`@astrojs/check`・`typescript`の新規インストールを要求される。CLAUDE.mdの「新規に依存関係を追加する前は比較案と変更計画を提示し承認を得る」に従い、無断導入せず未実施。lint自体の要否は`open-questions.md`のCI項目として保留中（2026-07-25、主催者へ確認し「今回は見送る」と回答済み）

## 横はみ出し確認

| 幅 | scrollWidth | clientWidth | 横はみ出し |
|---:|---:|---:|---|
| 390px | 390 | 390 | なし |
| 768px | 768 | 768 | なし |
| 1440px | 1440 | 1440 | なし |

## リンク確認

- 内部アンカー（`#top` `#about` `#information` `#tickets` `#content`）: 対応する`id`が全てDOM上に存在
- 外部リンク（HTTPステータス200を確認）
  - `https://teket.jp/19130/74082`（チケット。実際に開き、teket側で「販売期間外のチケットです」と表示され、8/22販売開始前の状態として正しく機能していることを確認。teket側の掲載表記が「琉球大学医学部**軽音楽部**」となっており、当サイトの確定表記「軽音部」と異なる点を発見。teket側の設定であり当リポジトリの範囲外だが、主催者側で修正が必要なら共有）
  - `https://www.instagram.com/ryuikeion/`
  - `https://ryuik-on.github.io/ryuik-on-official`
  - Google Maps検索リンク（会場住所）
- `target="_blank"`の全リンクに`rel="noopener"`付与を確認

## SEO / 共有

- `<html lang="ja">`、`<title>ROOM｜琉球大学医学部軽音部（Ryuik-on）</title>`
- canonical: `https://ryuik-on.github.io/ryu-ikon-room/`
- OGP（title/description/image/url/type/site_name/locale）、Twitter card、favicon（ico・192px png）を確認
- `robots.txt`・`sitemap.xml`（1URL）・`dist/404.html`の存在を確認
- JSON-LD（MusicEvent）をパースして検証。日時・会場・主催・料金区分・URLが全て確定事実と一致

## アクセシビリティ

- 見出し階層: h1(Hero) → h2×6（ABOUT/SCENE/FOUNDER'S NOTE/INFORMATION/TICKET/VENUE） → h3（VENUE内の会場名、venue-titleの下位として妥当） → h2（final-cta）。飛び番・重複なし
- 画像alt: コンテンツ写真3枚に具体的な代替テキスト、装飾画像（Hero/final-ctaの背景写真、ロゴイントロ）は空alt
- skip-link: Tab最初のフォーカスで出現し、視覚的に確認（朱色背景、はっきりしたコントラスト）
- `a:focus-visible, summary:focus-visible`に朱色2pxアウトライン＋オフセットを設定済み
- `prefers-reduced-motion: reduce`時、全アニメーション/トランジションを`0.01ms`に短縮するグローバルルールを確認済み（Heroの扉演出・ロゴイントロ・revealフェードを含む）

## 既知の残課題（公開可否判断用）

- 出演者情報・セットリスト: 未定のため「後日公開」表記のまま（主催者確認済み、2026-07-25）
- 解析ツール（GoatCounter）: 差し込み口は実装済みだがアカウント未作成のため未稼働（主催者確認済み、今回は見送り）
- Node/パッケージバージョン固定・CI導入: 未対応（主催者確認済み、今回は見送り）
- lint（`astro check`）: 依存追加の承認待ちのため未実施

## 制約

このツールセットにはブラウザ画面をPNGとして保存する手段がなく、画像ファイルの記録は未対応（Phase 3記録と同じ制約）。会話内のスクリーンショット表示と本記録で代替。

## 最終検品（2026-07-25 追記）

対象コミット: `8c8c610`まで（駐車場情報修正含む）

- モバイル（390px）: Hero→ABOUT→SCENE（写真3枚・キャプション）→FOUNDER'S NOTE→INFORMATION（2×2グリッド）→TICKET（有効化された購入ボタン・FAQ開閉動作）→VENUE（修正後の駐車場文言）→final-cta→footer（Instagram強調）まで全区間をスクロールしながら画面キャプチャで確認。表示崩れ・文字切れ・意図しない改行なし
- タブレット（768px）: Hero・INFORMATION・VENUE・footerをキャプチャ確認。モバイル用2カラムINFORMATIONグリッドが768px（<800pxブレークポイント内）でも正しく適用されることを確認
- デスクトップ（1440px）: ヘッダーnav（Instagram含む）とHeroをキャプチャ確認。以降はBrowserペイン側の描画不具合（スクロール後にキャプチャが黒くなる、本ツールセット既知の問題でサイト側の不具合ではない）でキャプチャが撮れなかったため、JS計測で代替検証：
  - `scrollWidth`/`clientWidth`とも1440pxで一致（横はみ出しなし）
  - INFORMATIONのdlは`display:block`の縦積みリスト（モバイル専用2カラム化は非適用、意図通り）
  - VENUEの地図装飾（`.venue-map`）は`display:block`で表示、駐車場修正後の案内文もDOM上で正しいテキスト
  - チケットCTA: `href`が常にteket URLを指し、`aria-disabled`なし（常時クリック可能）
- FAQアコーディオン（小人・学生料金について）の開閉、＋/−アイコンの切り替えを実クリックで確認
- 全操作を通してコンソールエラーなし

### 気づいた点（新規バグではなく既存設計）

- サイト全体でヘッダー（`position: fixed`、背景なし、`mix-blend-mode: difference`でブランド文字を反転表示）を採用しているため、スクロール中にセクション見出しの文字がヘッダー直下を通過する一瞬だけ文字同士が重なって見える（例: INFORMATIONの「SUN」とヘッダーの「ROOM」）。これは本セッションの変更によるものではなく元からの意匠。実際のスクロール操作では一瞬で流れるため実害は小さいと判断し、今回は修正対象としていない。気になる場合は今後の演出調整で検討
