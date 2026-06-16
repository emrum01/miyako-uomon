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

## MVPの範囲

- 魚6種類
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

魚画像はWeb上の画像URLを参照しています。個人利用向けのMVPです。

## 静的公開

このプロジェクトはビルド不要の静的サイトです。GitHub Pagesではリポジトリの `master` ブランチ直下を公開対象にします。

- エントリーポイント: `index.html`
- 公開ディレクトリ: リポジトリ直下
- セーブデータ: 各ブラウザの `localStorage`
- BGM / 効果音: `assets/` 配下
