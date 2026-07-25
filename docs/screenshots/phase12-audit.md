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
