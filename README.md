# ミヤコフィッシュクエスト MVP

宮古島周辺で見られる魚を、習性クイズで覚えるブラウザ完結型RPGのMVPです。

## 遊び方

`index.html` をブラウザで開きます。

1. 探索エリアを選ぶ
2. 矢印キー / WASD / 画面の十字ボタンでドット絵マップを歩く
3. マップ端から外へ進むと隣のエリアへ移動する
4. 魚に遭遇したら `たたかう` を選ぶ
5. 出てきた魚の名前・習性クイズに答える
6. 正解するたびに魚のHPが減る
7. HPを0にすると捕獲でき、うみコインを獲得する

## 生物データ（151種スケール対応）

生物データは `app.js` への直書きをやめ、外部JSON `data/species.json` に分離しています。
起動時に `fetch("./data/species.json")` で読み込み、正規化してから図鑑・遭遇・クイズを開始します。

- スキーマ: `id` / `nameJa` / `localName` / `scientificName` / `kingdomGroup`（大分類）/ `family` / `categoryId` / `categoryName` / `categoryNote` / `rarity` / `areas` / `habitat` / `diet` / `behavior` / `feature` / `danger` / `quizFacts` / `image` / `source`
- 大分類 `kingdomGroup`: 魚類・ウミガメ・サンゴ・ウミウシ・貝/巻貝・甲殻類・棘皮動物・クラゲ/イソギンチャク・海藻
- 図鑑は 大分類 / エリア / 分類 / レア度 / 全文検索 で絞り込み、一覧は最大160件表示
- クイズは `quizFacts` で出題対象を制御（サンゴ・海藻など食性が不自然な種は `diet` を空にし出題から除外）

### データ・画像のスクリプト

- `scripts/validate-species.mjs` — `data/species.json` のスキーマ/重複/件数検証（`node scripts/validate-species.mjs`）
- `scripts/fetch-species-images.mjs` — `image` URLから原画像を `assets/species/<id>/source.*` に取得
- `scripts/optimize-images.mjs` — 原画像を `main.webp`(横900px) / `thumb.webp`(横240px) に変換（macOS `sips`）

画像は `assets/species/<id>/main.webp`・`thumb.webp` をローカル保存する方針。未取得の種は
`image` を省略すると、表示時に `assets/species/placeholder.svg` へ自動フォールバックします。

## MVPの範囲

- 生物151種（`data/species.json`）
- エリア4種類
- Canvasのドット絵探索マップ
- エリア別の1画面マップと端移動
- 遭遇画面とアクション選択
- 敵HPと段階的なダメージ
- 捕獲時のボーナス獲得表示
- 名前クイズと習性クイズ3種類
- 捕獲・正解数・遭遇数のLocalStorage保存
- レア魚遭遇時のBGM切り替え
- スマホ対応

## BGM

- 通常バトルBGM: `assets/audio/battle-umi-no-himitsugyo.mp3`
- レア魚バトルBGM: `assets/audio/rare-shinkai-no-sogu.mp3`
- 平良港BGM: `assets/audio/maps/port-taira.mp3`
- 与那覇前浜BGM: `assets/audio/maps/beach-yonaha-maehama.mp3`
- 八重干瀬BGM: `assets/audio/maps/reef-yaebiji.mp3`
- 伊良部沖BGM: `assets/audio/maps/offshore-irabu-drift.mp3`
- BGM生成用プロンプト: `docs/bgm-prompts.md`
- 効果音素材: `assets/sfx/`
- 効果音素材メモ: `docs/sfx-sources.md`

## 画像素材について

各種の画像は `data/species.json` の `image` を参照します。ローカルの `assets/species/<id>/`
に WebP を保存して参照するのが推奨ですが、URL参照でも動作します。読み込めない画像は
`assets/species/placeholder.svg` に自動フォールバックするため、画像切れは表示されません。
個人利用・教育用途向けのMVPです。元画像の出典は各種の `source` に保持しています。

## 静的公開

このプロジェクトはビルド不要の静的サイトです。GitHub Pagesではリポジトリの `master` ブランチ直下を公開対象にします。

- エントリーポイント: `index.html`
- 公開ディレクトリ: リポジトリ直下
- セーブデータ: 各ブラウザの `localStorage`
- BGM / 効果音: `assets/` 配下
