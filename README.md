# ROOM v43 cleanup

- ROOM copyをis-visible依存から分離
- blackoutの強制非表示を削除し、JS曲線のみでフェード
- 孤立したkeyframes断片を除去
- globalProgressを粒子描画に接続
- OGP URL/canonical/faviconを設定
- ROOM表示ロジックをCSS固定、JSはcopy進行だけに整理
- reduced-motion変更と非表示タブでのRAF停止に対応
- チケットURL未確定のためボタンを一時的に無効化


## v44 cleanup
- Removed `.room-door`, `.light-bg`, and `.transition-core` from HTML/CSS.
- Retained the configured GitHub Pages OGP/canonical URL: `https://ryuik-on.github.io/ryu-ikon-room/`.
