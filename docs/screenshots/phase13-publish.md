# Phase 13 — mainへの切り替え・公開記録

実施日: 2026-07-25（Asia/Tokyo）

## 決定事項（主催者承認済み）

- Phase 13の実行そのものを主催者から明示的に指示された
- デプロイ方式は「ビルド成果物を`main`へ直接配置」を選択（GitHub Pagesの既存設定
  `Deploy from a branch: main / (root)`を変更しない案）。GitHub Actions化は見送り

## 実施内容

1. `rebuild/room-v2`（コミット`7b90cd0`）をorigin へpush（未pushの35コミットを退避）
2. `npm run build`でdist/を生成
3. `main`へ切り替え、v1の直置きファイル（`index.html` `style.css` `script.js`
   `assets/`）を削除し、dist/の中身をルートへ配置。ソース運用方針を`README.md`に明記
4. `main`へコミット・push（`0c824a5`）
5. 公開直後、`_astro/`配下の全アセットが404になる不具合を検知。原因はGitHub Pagesの
   デフォルトJekyllビルドがアンダースコア始まりのパスを除外すること。`.nojekyll`を
   `main`に追加して即修正（`3bca2b7`）。あわせて`rebuild/room-v2`の`public/.nojekyll`
   にも追加し、以後のビルドで自動的に含まれるようにした（`07d4f6f`）
6. 本番URL（`https://ryuik-on.github.io/ryu-ikon-room/`）で最終確認
   - トップページ200、CSS/画像/フォント全て200
   - Hero〜footerまでスクロールし、スタイル・画像とも正常表示（モバイル390px）
   - コンソールエラーなし
   - カスタム404（`ページが見つかりません｜ROOM`）が存在しないパスで正しく返る

## rollback手順（未使用、記録のみ）

問題が発生した場合、以下でv1へ即時復元できる。

```bash
git checkout main
git reset --hard room-v1-archive
git push origin main --force-with-lease
```

`room-v1-archive`タグはorigin上にも存在することを確認済み（タグコミット`2b825ba`が
今回の切替直前の`main`のHEADと一致）。

## 既知の残課題（公開後も引き続き有効）

`docs/screenshots/phase12-audit.md`の「既知の残課題」節を参照（出演者情報・セット
リスト未定、GoatCounter未稼働、Node/CI見送り）。これらは公開のブロッカーではない
と主催者が判断済み。
