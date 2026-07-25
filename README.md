# ROOM

音楽公演「ROOM」（2026年11月22日、那覇市ぶんかテンブス館）の公式サイト。

`main`ブランチにはビルド済みの静的ファイルのみを配置しています（GitHub Pagesの
「Deploy from a branch: main / (root)」設定でそのまま配信されます）。

## ソースコード

Astroのソースコードは`rebuild/room-v2`ブランチにあります。

```bash
git checkout rebuild/room-v2
npm install
npm run dev
```

## 更新方法

```bash
git checkout rebuild/room-v2
# 変更・コミット
npm run build
# dist/の中身をmainのルートへコピー
git checkout main
cp -R dist/. .   # rebuild/room-v2側でbuildした後、mainに切り替えてから配置
git add -A
git commit -m "..."
git push origin main
```

## v1（旧サイト）

`room-v1-archive`タグ、および`rebuild/room-v2`ブランチの`archive/room-v1/`に保存しています。
