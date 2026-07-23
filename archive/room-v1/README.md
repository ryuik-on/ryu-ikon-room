# ROOM v1 archive

このディレクトリは、2026-07-23時点の公開サイト（`main`の`2b825ba`）を再構築作業から分離して保存したものです。

## 内容

- `index.html` — 単一ページのHTMLとMusicEvent構造化データ
- `style.css` — レイアウト、タイポグラフィ、スクロール演出、レスポンシブ指定
- `script.js` — スクロール連動、Canvasパーティクル、motion tier制御
- `assets/` — v1に含まれていた画像・ロゴ一式（未使用素材を含む）

## 重要な制約

- このコードは記録・復元専用です。ROOM v2へ流用しません。
- `main`にはこの退避を反映せず、公開中のルート構成を維持します。
- GitHub ActionsやPages設定は元からリポジトリ内に存在せず、ここへ移動した設定はありません。

## 復元方法

公開時点そのものを確認・復元する場合は`room-v1-archive`を使用してください。localとremoteのタグはいずれも`main`の`2b825ba`を指します。

作業ツリーを変更せず内容だけ確認する例：

```sh
git show room-v1-archive:index.html
git ls-tree -r --name-only room-v1-archive
```

公開切り替えや`main`への反映は、人間の明示承認と公開前監査を経るまで行いません。
