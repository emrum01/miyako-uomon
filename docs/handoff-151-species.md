# 151種スケール対応 引き継ぎプロンプト

あなたは既存の静的Webゲーム「ミヤコフィッシュクエスト」をスケールさせる実装担当です。

## 作業ディレクトリ

`/Users/hirokiiwakubo/Documents/miyako-uomon`

## 公開URL

https://emrum01.github.io/miyako-uomon/

## GitHub repo

https://github.com/emrum01/miyako-uomon

## 現在の状態

- ビルドなしの静的サイト
- `index.html`, `styles.css`, `app.js` で構成
- GitHub Pages で `master` ブランチ root を公開中
- 現在の生物データは `app.js` 冒頭の `fishData` に直書き
- 図鑑、検索、レア度フィルタ、分類フィルタ、ボトムシート詳細表示は実装済み
- セーブデータは `localStorage`
- 画像は現在一部Web URL参照
- BGM/SFXは `assets/` 配下

## 目的

宮古島でシュノーケリングして見つかる生物を151種に増やし、図鑑・クイズ・遭遇・画像表示がスケールするようにする。

## 重要方針

1. Supabaseは使わない。静的サイトのまま進める。
2. データは `app.js` 直書きから外部JSONへ分離する。
3. 151種対応でも一覧が重くならないようにする。
4. 画像は可能ならローカルに保存・最適化する。
5. GitHub Pagesでそのまま動く構成を維持する。
6. 既存のUI/ゲーム体験は壊さない。
7. 既存ユーザーのlocalStorage進行データは可能な限り維持する。

## Step 1: データ分離

- `data/species.json` を作成する。
- `app.js` 冒頭の `fishData` をJSON読み込みに変更する。
- 起動時に `fetch("./data/species.json")` で読み込む。
- 読み込み完了後に `renderDex()`, `draw()` などを開始する。
- 読み込み失敗時はエラー表示する。
- 既存の7種データはまず `data/species.json` に移す。

### species schema

```json
{
  "id": "gurukun",
  "nameJa": "グルクン",
  "localName": "タカサゴ",
  "scientificName": "Pterocaesio digramma",
  "kingdomGroup": "魚類",
  "family": "タカサゴ科",
  "categoryId": "takasago",
  "categoryName": "タカサゴ科",
  "categoryNote": "細長い体で群れを作る、サンゴ礁まわりの中層遊泳タイプ。",
  "rarity": "common",
  "areas": ["port", "reef"],
  "habitat": "サンゴ礁のまわりで群れを作り、中層を泳ぐ。",
  "diet": "動物プランクトンを食べる。",
  "behavior": "群れで素早く泳ぎ、外敵から身を守る。",
  "feature": "沖縄県魚。水中では銀色の群れが一枚のカーテンみたいに向きを変える。",
  "danger": "低い",
  "image": "./assets/species/gurukun/main.webp",
  "source": "https://www.fishbase.se/summary/speciessummary.php?id=933"
}
```

## Step 2: 151種データ作成

対象は「魚」だけでなく、宮古島シュノーケリングで見つかる生物全般にする。

含めたい大分類:

- 魚類
- ウミガメ
- サンゴ
- ウミウシ
- 貝・巻貝
- 甲殻類
- 棘皮動物
- クラゲ・イソギンチャク
- 海藻

フィルタ用分類例:

- タカサゴ科
- ブダイ科
- ハタ科
- フエフキダイ科
- スズメダイ科
- チョウチョウウオ科
- ベラ科
- ニザダイ科
- モンガラカワハギ科
- フグ目
- ウミガメ科
- ミドリイシ属
- ナマコ類
- ヒトデ類
- ウミウシ類
- エビ・カニ類

情報源:

- FishBase: 魚類の分類・生態
- SeaLifeBase: 魚以外の海洋生物
- GBIF: 分布・画像・観察情報
- iNaturalist: 沖縄・宮古周辺の観察記録と画像候補
- Wikimedia Commons: 画像候補

## Step 3: 画像収集

- `assets/species/<id>/main.webp`
- `assets/species/<id>/thumb.webp`

上記の形式で保存する。

- 元画像URLは `source` または `imageSource` に保持する。
- WebP化する。
- mainは最大横幅 900px 程度。
- thumbは 240px 程度。
- 画像が取れない種は一旦 `assets/species/placeholder.webp` を使う。

画像最適化コマンド例:

```bash
mkdir -p assets/species/<id>
sips -s format webp input.jpg --out assets/species/<id>/main.webp
sips -Z 240 assets/species/<id>/main.webp --out assets/species/<id>/thumb.webp
```

可能なら Node/Python script を作る:

- `scripts/fetch-species-images.mjs`
- `scripts/optimize-images.mjs`
- `scripts/validate-species.mjs`

## Step 4: 図鑑スケール対応

既存の図鑑は以下がある:

- 専用画面
- 検索
- レア度フィルタ
- 分類フィルタ
- 魚選択で下からボトムシート詳細
- 外側タップで閉じる

151種化で追加したい:

- 大分類フィルタ `kingdomGroup`
- エリアフィルタ `areas`
- 画像サムネイルは `thumb.webp` を使う
- 詳細だけ `main.webp` を使う
- 一覧は最大160件表示の既存制限を維持
- 将来1000種になっても検索/フィルタ前提で破綻しないようにする

## Step 5: クイズ対応

現在の仕様:

- 未捕獲の魚は最初の問題が名前当て
- 捕獲済みなら名前問題は省く
- 正解でHPが減る
- rare 5 / uncommon 4 / common 3
- レア魚は何回か間違えると逃げる

151種対応で追加:

- 生物全般でも自然なクイズにする
- `nameJa`, `categoryName`, `habitat`, `diet`, `behavior`, `feature` を問題対象にする
- サンゴや海藻など「食べもの」が不自然なものは `diet` を空にせず、適切な説明にするか、問題対象から除外できるよう `quizFacts` を持たせる

例:

```json
"quizFacts": ["name", "category", "habitat", "behavior", "feature"]
```

## Step 6: 音声最適化

現在:

- `assets/audio/*.mp3`
- `assets/audio/maps/*.mp3`
- `assets/sfx/*`

やること:

- 音量差を確認
- BGMは必要なら 128kbps 程度に圧縮
- SFXは短く軽く
- GitHub Pagesで読み込みが重くなりすぎないようにする
- 不要な音声があれば削る

ffmpegが使えるなら:

```bash
ffmpeg -i input.mp3 -b:a 128k output.mp3
ffmpeg -i input.wav -c:a libopus -b:a 64k output.ogg
```

## Step 7: 検証

必ず確認する:

```bash
node --check app.js
```

ローカルサーバー:

```bash
python3 -m http.server 5173
```

ブラウザ確認:

- `http://localhost:5173/`
- 図鑑が開く
- 検索できる
- 大分類/分類/レア度/エリアで絞れる
- 詳細ボトムシートが開閉する
- ランダム遭遇で151種から出る
- 未捕獲は最初に名前問題
- 捕獲済みは名前問題なし
- 画像切れがない
- コンソールエラーがない

## Step 8: GitHub Pages公開

変更後:

```bash
git status
git add .
git commit -m "Scale species catalog"
git push
```

公開確認:

```bash
curl -L -I https://emrum01.github.io/miyako-uomon/
```

## 注意

- 既存の作業を勝手に戻さない。
- `app.js`, `index.html`, `styles.css` は既存UIを尊重して最小変更。
- 大量データは必ず `data/species.json` に分離。
- 画像が多くなるので、画像最適化を必ず行う。
- 151種すべての説明は「覚えるコツ」ではなく、生物の習性そのものを書く。
- 宮古島・沖縄のシュノーケリングで見られる可能性が高い生物を優先する。
- 不確かな情報は断定しすぎず、sourceを残す。
