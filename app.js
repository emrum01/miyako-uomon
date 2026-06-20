// 生物データは data/species.json から読み込む（起動時に loadSpecies() が実行）。
let fishData = [];

const SPECIES_URL = "./data/species.json";
const PLACEHOLDER_IMAGE = "./assets/species/placeholder.svg";

// 大分類（kingdomGroup）の表示順。species.json 内の値はこの順で並べる。
const kingdomGroups = [
  "魚類",
  "ウミガメ",
  "サンゴ",
  "ウミウシ",
  "貝・巻貝",
  "甲殻類",
  "棘皮動物",
  "クラゲ・イソギンチャク",
  "海藻",
];

// JSON の1レコードを、ゲーム内部で使う形へ正規化する。
// 既存コードが name / scientific を参照しているため別名を付与する。
function normalizeSpecies(raw) {
  const name = raw.nameJa ?? raw.name ?? raw.id;
  const scientific = raw.scientificName ?? raw.scientific ?? "";
  const image = raw.image || PLACEHOLDER_IMAGE;
  const thumb = raw.thumb || image;
  // quizFacts 未指定時は、中身のある説明フィールドから自動で決める。
  let quizFacts = Array.isArray(raw.quizFacts) ? raw.quizFacts.slice() : null;
  if (!quizFacts) {
    quizFacts = ["name", "category", "habitat", "behavior", "feature"];
    if (raw.diet && raw.diet.trim()) quizFacts.splice(3, 0, "diet");
  }
  return {
    id: raw.id,
    name,
    localName: raw.localName || name,
    scientific,
    kingdomGroup: raw.kingdomGroup || "魚類",
    family: raw.family || raw.categoryName || "",
    categoryId: raw.categoryId,
    categoryName: raw.categoryName,
    categoryNote: raw.categoryNote || "",
    rarity: raw.rarity || "common",
    areas: Array.isArray(raw.areas) ? raw.areas : [],
    habitat: raw.habitat || "",
    diet: raw.diet || "",
    behavior: raw.behavior || "",
    feature: raw.feature || "",
    danger: raw.danger || "低い",
    quizFacts,
    image,
    thumb,
    source: raw.source || raw.imageSource || "",
    imageAttribution: raw.imageAttribution || "",
    imageLicense: raw.imageLicense || "",
  };
}

const areas = [
  { id: "port", name: "平良港", description: "桟橋の近く。群れの魚が多い", color: "#5aaec0" },
  { id: "beach", name: "与那覇前浜", description: "白砂の浅場。小型魚と砂地の魚", color: "#e8c56e" },
  { id: "reef", name: "八重干瀬", description: "サンゴ礁。習性の違いが出やすい", color: "#ef735f" },
  { id: "offshore", name: "伊良部沖", description: "深場。レア魚の気配がある", color: "#155f8a" },
  { id: "mangrove", name: "島尻マングローブ", description: "汽水のマングローブ林。ボラやハゼ、稚魚たち", color: "#5b8c5a" },
  { id: "bluehole", name: "通り池", description: "下地島の神秘の淵。深海の気配がする", color: "#0a2f5c" },
  { id: "ogami", name: "大神島", description: "神々の島。海の主が棲むという聖域", color: "#7a5fa0" },
];

const quizTypes = [
  {
    key: "name",
    label: "名前",
    question: () => "この魚の名前は？",
  },
  {
    key: "category",
    label: "分類",
    question: (fish) => `${fish.name}はどのグループ（分類）の生きもの？`,
  },
  {
    key: "habitat",
    label: "すみか",
    question: (fish) => `${fish.name}は主にどんな場所で見つかる？`,
  },
  {
    key: "diet",
    label: "食べもの",
    question: (fish) => `${fish.name}は何を食べる習性がある？`,
  },
  {
    key: "behavior",
    label: "行動",
    question: (fish) => `${fish.name}らしい行動はどれ？`,
  },
  {
    key: "feature",
    label: "おもしろ習性",
    question: (fish) => `${fish.name}の覚えておきたい特徴は？`,
  },
];

const tileSize = 32;
const mapCols = 20;
const mapRows = 30;
// マップ（プレイ領域）の固定サイズ。スマホ/タブレットではcanvasと同じ。
// PCではcanvasを横長にし、この左側にマップ、右側に情報パネルを描く。
const MAP_W = mapCols * tileSize; // 640
const MAP_H = mapRows * tileSize; // 960
const WIDE_CANVAS_W = 1160; // PC時のcanvas内部幅（マップ640 + 情報パネル520）
const playerStart = { x: 10, y: 10 };
const battleBgmSources = {
  normal: "./assets/audio/battle-umi-no-himitsugyo.mp3",
  rare: "./assets/audio/rare-shinkai-no-sogu.mp3",
  legendary: "./assets/audio/legendary-umi-no-nushi.mp3",
};
const mapBgmSources = {
  port: "./assets/audio/maps/port-taira.mp3",
  beach: "./assets/audio/maps/beach-yonaha-maehama.mp3",
  reef: "./assets/audio/maps/reef-yaebiji.mp3",
  offshore: "./assets/audio/maps/offshore-irabu-drift.mp3",
  mangrove: "./assets/audio/maps/mangrove-shimajiri.mp3",
  bluehole: "./assets/audio/maps/bluehole-toriike.mp3",
  ogami: "./assets/audio/maps/ogami-sanctuary.mp3",
};
const sfxSources = {
  encounter: "./assets/sfx/encounter.ogg",
  rareEncounter: "./assets/sfx/rare-encounter.ogg",
  select: "./assets/sfx/select.wav",
  menu: "./assets/sfx/menu.wav",
  correct: "./assets/sfx/correct.ogg",
  wrong: "./assets/sfx/wrong.wav",
  damage: "./assets/sfx/damage.ogg",
  capture: "./assets/sfx/capture.ogg",
  coin: "./assets/sfx/coin.wav",
  run: "./assets/sfx/run.wav",
};
const mapDefinitions = {
  port: {
    exits: { right: "beach", left: "mangrove" },
    start: { x: 10, y: 10 },
  },
  beach: {
    exits: { left: "port", right: "reef" },
    start: { x: 2, y: 10 },
  },
  reef: {
    exits: { left: "beach", right: "offshore" },
    start: { x: 2, y: 10 },
  },
  offshore: {
    exits: { left: "reef", right: "bluehole" },
    start: { x: 2, y: 10 },
  },
  mangrove: {
    exits: { right: "port", left: "ogami" },
    start: { x: 17, y: 15 },
  },
  bluehole: {
    exits: { left: "offshore" },
    start: { x: 2, y: 15 },
  },
  ogami: {
    exits: { right: "mangrove" },
    start: { x: 18, y: 15 },
  },
};

// ---- 秘伝技・地形タイルマップ（スライス1: データ基盤） ----

// 地形種別
const T = { SEA: 0, SHALLOW: 1, SAND: 2, REEF: 3, CORAL: 4, ROCK: 5, PIER: 6, LAND: 7, DEEP: 8, FOAM: 9 };
// 歩行可能な地形。LAND(陸)・ROCK(岩礁)は通行不可。
const WALKABLE = new Set([T.SEA, T.SHALLOW, T.SAND, T.REEF, T.CORAL, T.PIER, T.DEEP, T.FOAM]);

// 秘伝技メタ
const ABILITIES = {
  surf: { id: "surf", name: "なみのり", price: 120, desc: "荒波やうず潮をのりこえる" },
  light: { id: "light", name: "ライト", price: 90, desc: "暗がりや洞窟を照らす" },
  cut: { id: "cut", name: "たちきり", price: 70, desc: "流木や倒木を断ち切る" },
  reeds: { id: "reeds", name: "くさわけ", price: 100, desc: "マングローブの茂みを かき分ける" },
  dive: { id: "dive", name: "ダイブ", price: 150, desc: "ブルーホールの淵へ もぐる" },
  ugan: { id: "ugan", name: "うがん", price: 400, desc: "大神島の拝所に祈り 聖域へ入る" },
};
const OBSTACLE_LABEL = { drift: "流木", surge: "うず潮", cave: "暗い洞窟", reeds: "マングローブの茂み", abyss: "ブルーホールの淵", sacred: "拝所の鳥居" };
// ゲート障害物。各マップで「複数マスのテーマ障害物の帯」が通路の断面を完全封鎖する。
// 下地はすべて歩行可能な水/地形。対応する秘伝技で帯ごと消滅し、開けた水面が残って地続きになる。
// 帯の形・向き・太さ・位置はロケーションごとに別々に設計（同じ形は使い回さない）:
//   beach=斜めに折り重なる流木の雁行帯 / reef=うず潮のS字曲線 / offshore=横に幅広い濃霧の壁 /
//   mangrove=葦・支柱根の不定形ジグザグ茂み / bluehole=ブルーホールの縁を弧で囲う渦帯 /
//   ogami=参道に整列した鳥居の人工的な結界ライン。
// id は不変（cleared/__cleared のセーブ互換）。cells = 障害物が占める全マス [[x,y],...]。
const GATES = {
  beach: [{ id: "g_beach_drift", type: "drift", ability: "cut", cells: [[5,1],[6,1],[7,1],[5,2],[6,2],[7,2],[5,3],[6,3],[7,3],[5,4],[6,4],[7,4],[6,5],[7,5],[8,5],[6,6],[7,6],[8,6],[6,7],[7,7],[8,7],[6,8],[7,8],[8,8],[7,9],[8,9],[9,9],[7,10],[8,10],[9,10],[7,11],[8,11],[9,11],[7,12],[8,12],[9,12],[8,13],[9,13],[10,13],[8,14],[9,14],[10,14],[8,15],[9,15],[10,15],[8,16],[9,16],[10,16],[9,17],[10,17],[11,17],[9,18],[10,18],[11,18],[9,19],[10,19],[11,19],[9,20],[10,20],[11,20],[10,21],[11,21],[12,21],[10,22],[11,22],[12,22],[10,23],[11,23],[12,23],[10,24],[11,24],[12,24],[11,25],[12,25],[13,25],[11,26],[12,26],[13,26],[11,27],[12,27],[13,27],[11,28],[12,28],[13,28]] }],
  reef: [{ id: "g_reef_surge", type: "surge", ability: "surf", cells: [[9,1],[10,1],[11,1],[9,2],[10,2],[11,2],[9,3],[10,3],[11,3],[12,3],[10,4],[11,4],[12,4],[10,5],[11,5],[12,5],[13,5],[11,6],[12,6],[13,6],[11,7],[12,7],[13,7],[11,8],[12,8],[13,8],[11,9],[12,9],[13,9],[10,10],[11,10],[12,10],[13,10],[10,11],[11,11],[12,11],[10,12],[11,12],[12,12],[9,13],[10,13],[11,13],[12,13],[8,14],[9,14],[10,14],[11,14],[8,15],[9,15],[10,15],[7,16],[8,16],[9,16],[10,16],[6,17],[7,17],[8,17],[9,17],[6,18],[7,18],[8,18],[6,19],[7,19],[8,19],[5,20],[6,20],[7,20],[8,20],[5,21],[6,21],[7,21],[5,22],[6,22],[7,22],[5,23],[6,23],[7,23],[5,24],[6,24],[7,24],[5,25],[6,25],[7,25],[8,25],[6,26],[7,26],[8,26],[6,27],[7,27],[8,27],[9,27],[7,28],[8,28],[9,28]] }],
  offshore: [{ id: "g_off_cave", type: "cave", ability: "light", cells: [[8,1],[9,1],[10,1],[11,1],[8,2],[9,2],[10,2],[11,2],[8,3],[9,3],[10,3],[11,3],[8,4],[9,4],[10,4],[11,4],[8,5],[9,5],[10,5],[11,5],[8,6],[9,6],[10,6],[11,6],[8,7],[9,7],[10,7],[11,7],[8,8],[9,8],[10,8],[11,8],[8,9],[9,9],[10,9],[11,9],[8,10],[9,10],[10,10],[11,10],[8,11],[9,11],[10,11],[11,11],[8,12],[9,12],[10,12],[11,12],[8,13],[9,13],[10,13],[11,13],[8,14],[9,14],[10,14],[11,14],[8,15],[9,15],[10,15],[11,15],[8,16],[9,16],[10,16],[11,16],[8,17],[9,17],[10,17],[11,17],[8,18],[9,18],[10,18],[11,18],[8,19],[9,19],[10,19],[11,19],[8,20],[9,20],[10,20],[11,20],[8,21],[9,21],[10,21],[11,21],[8,22],[9,22],[10,22],[11,22],[8,23],[9,23],[10,23],[11,23],[8,24],[9,24],[10,24],[11,24],[8,25],[9,25],[10,25],[11,25],[8,26],[9,26],[10,26],[11,26],[8,27],[9,27],[10,27],[11,27],[8,28],[9,28],[10,28],[11,28]] }],
  mangrove: [{ id: "g_mangrove_reeds", type: "reeds", ability: "reeds", cells: [[8,1],[9,1],[10,1],[8,2],[9,2],[10,2],[11,2],[12,2],[7,3],[8,3],[9,3],[9,4],[10,4],[11,4],[9,5],[10,5],[11,5],[12,5],[13,5],[8,6],[9,6],[10,6],[7,7],[8,7],[9,7],[7,8],[8,8],[9,8],[10,8],[11,8],[9,9],[10,9],[11,9],[7,10],[8,10],[9,10],[7,11],[8,11],[9,11],[10,11],[11,11],[9,12],[10,12],[11,12],[10,13],[11,13],[12,13],[8,14],[9,14],[10,14],[11,14],[12,14],[8,15],[9,15],[10,15],[7,16],[8,16],[9,16],[6,17],[7,17],[8,17],[9,17],[10,17],[8,18],[9,18],[10,18],[9,19],[10,19],[11,19],[7,20],[8,20],[9,20],[10,20],[11,20],[7,21],[8,21],[9,21],[9,22],[10,22],[11,22],[7,23],[8,23],[9,23],[10,23],[11,23],[9,24],[10,24],[11,24],[7,25],[8,25],[9,25],[7,26],[8,26],[9,26],[10,26],[11,26],[9,27],[10,27],[11,27],[8,28],[9,28],[10,28]] }],
  bluehole: [{ id: "g_bluehole_abyss", type: "abyss", ability: "dive", cells: [[8,1],[9,1],[8,2],[9,2],[8,3],[9,3],[8,4],[9,4],[8,5],[9,5],[10,5],[11,5],[12,5],[13,5],[14,5],[15,5],[16,5],[17,5],[18,5],[13,6],[14,6],[15,6],[16,6],[17,6],[18,6],[11,7],[12,7],[13,7],[14,7],[10,8],[11,8],[12,8],[9,9],[10,9],[11,9],[9,10],[10,10],[8,11],[9,11],[10,11],[8,12],[9,12],[8,13],[9,13],[8,14],[9,14],[8,15],[9,15],[8,16],[9,16],[8,17],[9,17],[8,18],[9,18],[8,19],[9,19],[10,19],[9,20],[10,20],[9,21],[10,21],[11,21],[10,22],[11,22],[12,22],[11,23],[12,23],[13,23],[14,23],[13,24],[14,24],[15,24],[16,24],[17,24],[18,24],[8,25],[9,25],[10,25],[11,25],[12,25],[13,25],[14,25],[15,25],[16,25],[17,25],[18,25],[8,26],[9,26],[8,27],[9,27],[8,28],[9,28]] }],
  ogami: [{ id: "g_ogami_sacred", type: "sacred", ability: "ugan", cells: [[10,1],[11,1],[10,2],[11,2],[10,3],[11,3],[10,4],[11,4],[10,5],[11,5],[10,6],[11,6],[10,7],[11,7],[10,8],[11,8],[10,9],[11,9],[10,10],[11,10],[10,11],[11,11],[10,12],[11,12],[10,13],[11,13],[10,14],[11,14],[10,15],[11,15],[10,16],[11,16],[10,17],[11,17],[10,18],[11,18],[10,19],[11,19],[10,20],[11,20],[10,21],[11,21],[10,22],[11,22],[10,23],[11,23],[10,24],[11,24],[10,25],[11,25],[10,26],[11,26],[10,27],[11,27],[10,28],[11,28]] }],
};

// タイルマップ定義（20文字 x 30行。1文字 = Tの値 0-9）。
// 設計: 岩/陸の縦壁による2分割は全廃。下地はすべて歩ける開けた水/地形＋装飾。
//   通路を塞ぐのは GATES の「複数マスのテーマ障害物の帯」だけで、その帯が通路の断面を完全封鎖する。
//   秘伝技で帯ごと消滅すると開けた水面が残り、マップが地続きになる。
//   帯の形はロケーションごとに別設計(斜め雁行/S字曲線/幅広の壁/不定形の塊/円弧/直線の列)。
//   上下枠(row0/29)のみ最小限の地形(ROCK/LAND)で帯端を閉じ、回り込みを防ぐ(2分割はしない)。
//   隣接マップがある辺の端カラム(x0/x19)はrows1-28を歩行可能に保ち、transferMap着地のソフトロックを防ぐ。
const MAP_TILES_RAW = {
  // 平良港: 桟橋(6)+岸壁(7)+防波堤(5)+船だまり(1/2)+波打ち際(9)+海(0)。ゲート無し・自由通行。
  port: [
    "77777777777777777777",
    "11222111000000011110",
    "11226660000005001110",
    "11226660001115550010",
    "11226660001110050010",
    "11229990000000000000",
    "11000000000000550000",
    "10000000000000550000",
    "10001110000000000000",
    "10011111000000011100",
    "10011000000000011100",
    "10000000000005000000",
    "10000000000005000000",
    "10000066600005000000",
    "10000066600000000000",
    "10000066600000000000",
    "10000000000000000111",
    "10000000005550000111",
    "10000000005550000011",
    "10000000000000000000",
    "10000099900000000000",
    "10022211100000000000",
    "10222211100000000000",
    "10222111000000000000",
    "10221110000000550000",
    "10011000000000550000",
    "10000000000000000000",
    "10000000099990000000",
    "10000022211222000000",
    "77777777777777777777",
  ],
  // 与那覇前浜(白砂ラグーン): 浅瀬(1)+砂州(2)+サンゴ片(4)+海(0)。下地はすべて歩ける開けた潟。
  // ゲート=流木(cut)の「斜めに折り重なった雁行帯」。上枠から下枠へ向け右下へ階段状に流れる短い斜め帯。
  // 上下枠のみ磯(ROCK)で帯端を閉じる。x0/x19はrows1-28歩行可(左=port, 右=reef)。
  beach: [
    "55555555555555555555", // 0
    "22221110009111122222", // 1   上辺の白砂浜（波打ち際9）
    "22211119000911122222", // 2
    "22111100000011112222", // 3
    "21111000004001111222", // 4   砂州とタイドプール(4)
    "21110009000900111222", // 5
    "21100000100001111122", // 6
    "21100001110001111122", // 7   左ラグーンの浅瀬
    "22110011111001111222", // 8
    "22111001110001111222", // 9
    "22211100000001112222", // 10
    "11110500000050011112", // 11  点在するタイドプールの岩(5)
    "11104000900000011111", // 12
    "11100009000000011111", // 13
    "11110000000000111122", // 14
    "21111000110001111122", // 15  中央砂州
    "22111001110001111222", // 16
    "22211000110001112222", // 17
    "21110000900009011122", // 18
    "21100009000000011122", // 19
    "21104000000050011112", // 20  タイドプール
    "11100000000000011111", // 21
    "11100200000004011111", // 22
    "22110011100011112222", // 23  下のラグーン浅瀬
    "22111111100111112222", // 24
    "22211119000911122222", // 25
    "22221119000911122222", // 26  下辺の白砂浜（波打ち際9）
    "22222119992999222222", // 27
    "22222222222222222222", // 28  砂浜
    "55555555555555555555", // 29
  ],
  // 八重干瀬(サンゴ礁): サンゴ礁列(3)+サンゴ(4)+海の水路(0)。下地はサンゴの筋目が並ぶ開けた礁原。
  // ゲート=うず潮(surf)の「S字に蛇行する曲線帯」。上で右へ膨らみ下で左へ反る、湾曲した連なり。
  // 上下枠のみ根(ROCK)。x0/x19はrows1-28歩行可(左=beach, 右=offshore)。
  reef: [
    "55555555555555555555", // 0
    "03340000000003344300", // 1   左右の大きなサンゴ礁クラスタ
    "03443000000003443300", // 2
    "00344300000003443400", // 3
    "00043300000004433000", // 4
    "33004400000000043433", // 5
    "44300034000000034443", // 6   間を水路(0)が縫う
    "43300344000004433440", // 7
    "00000443000044330000", // 8
    "00003443000034430000", // 9
    "00034430000000334000", // 10
    "00344300000000043400", // 11
    "03443000000000044330", // 12
    "34430000000000004433", // 13
    "44300003340000000443", // 14
    "43000034430000000044", // 15
    "30000344300000003440", // 16
    "00003443000000034430", // 17
    "00034430000000344300", // 18
    "00344300000003443000", // 19
    "03443400000034433000", // 20
    "34433000000344330000", // 21
    "44330000003443430000", // 22
    "43300000034430044300", // 23
    "33000003443000044330", // 24
    "30000034430000004443", // 25
    "00003443000000003443", // 26
    "00034430000000003443", // 27
    "03344300000000033443", // 28
    "55555555555555555555", // 29
  ],
  // 伊良部沖(外洋): 外洋(0)+深溝(8)+ピナクル(5)。下地は広い外洋＋右の深溝(レア魚の深場)。
  // ゲート=暗がり/濃霧(light)の「横に幅広く立ちこめる厚い霧の壁」(4マス厚)。細い縦帯でなく幅広。
  // 右端x19はDEEPでbluehole、左端x0は海でreef(rows1-28歩行可)。
  offshore: [
    "55555555555555555555", // 0
    "00000008000088888888", // 1   右の深溝を広げる(8)
    "00000088000888888888", // 2
    "00050088000088888888", // 3   ピナクル(5)点在
    "00000088000888888888", // 4
    "00800008000088888888", // 5   左の外洋にも深場の窪み
    "00880000000088888888", // 6
    "08800000000888888888", // 7
    "08000000000088888888", // 8
    "00000000000888888888", // 9
    "00050000000088888888", // 10  ピナクルの根
    "00000000000888888888", // 11
    "00800000000088888888", // 12
    "08800000000888888888", // 13
    "08000000000088888888", // 14
    "00050000000088888888", // 15
    "00000000000888888888", // 16
    "00000000000088888888", // 17
    "00080000000888888888", // 18
    "00880000000088888888", // 19
    "08800000000888888888", // 20
    "08000000000088888888", // 21
    "00000000000888888888", // 22
    "00050000000088888888", // 23  沈船周辺の深場
    "00000000000888888888", // 24
    "00000500000088888888", // 25
    "00080000000888888888", // 26
    "00880000000088888888", // 27
    "08800000000888888888", // 28
    "55555555555555555555", // 29
  ],
  // 島尻マングローブ(汽水): 浅瀬(1)+泡(9)+海(0)+マングローブ林(7=LAND点在)。下地は開けた汽水域。
  // ゲート=葦・支柱根(reeds)の「不定形にジグザグ密生する茂みの塊」。太さも縁も乱れた塊状(直線でない)。
  // 右側=入口(portから, start17,15)、左側=本体(ogamiへ)。上下枠はマングローブ林(LAND)。
  // x0/x19はrows1-28歩行可(右=port, 左=ogami接続)。茂み解除でのみ左→ogamiへ抜けられる。
  mangrove: [
    "77777777777777777777", // 0
    "21177000000000077112", // 1   左右にマングローブ林(7)の縁
    "22170010000100007122", // 2   干潟の浅瀬(1)・砂泥(2)
    "27100100000010001722", // 3
    "27101000000000100172", // 4
    "21100009000900010112", // 5   汽水の泡(9)
    "11100070001000700112", // 6   点在する支柱根(7)
    "21100000000010000122", // 7
    "22110010000000001122", // 8
    "27100107000000100172", // 9
    "27101000000010001072", // 10
    "21170000000000007112", // 11
    "11100010009010001012", // 12
    "21100700000000700122", // 13
    "27109000000000009172", // 14  泡(9)
    "27100010000010000172", // 15
    "21100100000000100112", // 16
    "11107000000000070012", // 17
    "21100010000010000122", // 18
    "27100100000000100172", // 19
    "27170700000000007072", // 20
    "21100009000900010112", // 21
    "11100010000000700112", // 22
    "21100100000010001022", // 23
    "27107000000000007172", // 24
    "27100010000700100072", // 25
    "21100100000010000112", // 26
    "22110007000000001122", // 27
    "27100070000000700172", // 28
    "77777777777777777777", // 29
  ],
  // 通り池(ブルーホール): 深淵(8)+海(0)+ピナクル(5)。下地は左の浅い接近水面＋右の深淵(最深部)。
  // ゲート=渦・落ち口(dive)の「ブルーホールの縁を弧で囲う帯」。右の深淵を抱くように左へ膨らむ円弧状。
  // 左側=入口(offshoreから, start2,15)、右側=最深部(レア魚)。
  // 左端x0はrows1-28歩行可(offshore)。右端x19=ROCK壁(隣接なし)。
  bluehole: [
    "55555555555555555555", // 0
    "11100000005088888885", // 1   左=入口の浅瀬(1)、縁の根(5)
    "11110000000088888885", // 2
    "11100050000088888885", // 3
    "11100000000088888885", // 4
    "11100000000088888885", // 5
    "11000000005888888885", // 6   深淵のリム(5)
    "11000000000888888885", // 7
    "10000000000088888885", // 8
    "10000000000888888885", // 9
    "10000005000888888885", // 10  接近水面の根
    "00000000000088888885", // 11
    "00000000000088888885", // 12
    "00000000005888888885", // 13  リムの根
    "00000000000888888885", // 14
    "00000000000088888885", // 15
    "00000000000088888885", // 16
    "00000000000888888885", // 17
    "00000000005888888885", // 18
    "00000000000088888885", // 19
    "10000000000088888885", // 20
    "10000005000888888885", // 21
    "11000000000088888885", // 22
    "11000000000088888885", // 23
    "11100050000088888885", // 24
    "11100000000088888885", // 25
    "11100000005088888885", // 26
    "11110000000088888885", // 27
    "11100000000088888885", // 28
    "55555555555555555555", // 29
  ],
  // 大神島(聖域): 聖域の深海(8)+海(0)+浅瀬(1)+御嶽の杜(7=LAND)。下地は右の参道と左の聖域深海。
  // ゲート=鳥居・注連縄(ugan)の「参道に整然と並ぶ人工的な結界の縦ライン」。他と全く違う直線・等間隔の列。
  // 右側=参道の入口(mangroveから, start18,15)、左側=聖域(海の主の釣り場)。
  // 右端x19はrows1-28歩行可(mangrove)。左端x0=ROCK壁(隣接なし)。
  ogami: [
    "55555555555555555555", // 0
    "58888888800001111110", // 1   右=参道の浅瀬(1)
    "58887788800001114110", // 2   御嶽の杜(7)の小島・サンゴ(4)
    "58877888800000111100", // 3
    "58878888800000011000", // 4
    "58888888800000000000", // 5
    "58888858800000111000", // 6   聖域の深海の根(5)
    "58888888800001141100", // 7
    "58888888800001111100", // 8
    "58885888800000011000", // 9   根
    "58888888800000010000", // 10
    "58888888800000000000", // 11
    "58888588800000111000", // 12  根
    "58888888800001141100", // 13
    "58887888800001111100", // 14  杜の小島
    "58877888800000011000", // 15
    "58888888800000000000", // 16
    "58888888800000111000", // 17
    "58888588800001141100", // 18  根
    "58888888800001111100", // 19
    "58888888800000011000", // 20
    "58888888800000000000", // 21
    "58885888800000111000", // 22  根
    "58888888800001141100", // 23
    "58887788800001111100", // 24  杜の小島
    "58877888800000011000", // 25
    "58888888800000000000", // 26
    "58888888800000111000", // 27
    "58888858800001111110", // 28  根
    "55555555555555555555", // 29
  ],
};
function expandMap(rows) {
  return rows.map((r) => [...r].map((c) => Number(c)));
}
const mapTiles = Object.fromEntries(
  Object.entries(MAP_TILES_RAW).map(([k, v]) => [k, expandMap(v)])
);
function tileAt(mapId, x, y) {
  return mapTiles[mapId]?.[y]?.[x] ?? T.SEA;
}

const elements = {
  canvas: document.querySelector("#gameCanvas"),
  menuPanel: document.querySelector("#menuPanel"),
  menuToggle: document.querySelector("#menuToggle"),
  areaList: document.querySelector("#areaList"),
  areaStatus: document.querySelector("#areaStatus"),
  dexScreen: document.querySelector("#dexScreen"),
  dexOpenButton: document.querySelector("#dexOpenButton"),
  dexCloseButton: document.querySelector("#dexCloseButton"),
  dexSearchInput: document.querySelector("#dexSearchInput"),
  dexSearchClear: document.querySelector("#dexSearchClear"),
  dexFilterToggle: document.querySelector("#dexFilterToggle"),
  dexFilterPopup: document.querySelector("#dexFilterPopup"),
  dexFilterPanel: document.querySelector("#dexFilterPanel"),
  dexFilterList: document.querySelector("#dexFilterList"),
  dexKingdomList: document.querySelector("#dexKingdomList"),
  dexAreaList: document.querySelector("#dexAreaList"),
  dexCategoryList: document.querySelector("#dexCategoryList"),
  dexList: document.querySelector("#dexList"),
  dexDetailScrim: document.querySelector("#dexDetailScrim"),
  dexDetailPanel: document.querySelector("#dexDetailPanel"),
  shopScreen: document.querySelector("#shopScreen"),
  shopOpenButton: document.querySelector("#shopOpenButton"),
  shopCloseButton: document.querySelector("#shopCloseButton"),
  shopList: document.querySelector("#shopList"),
  shopBalance: document.querySelector("#shopBalance"),
  commandPanel: document.querySelector("#commandPanel"),
  quizPanel: document.querySelector("#quizPanel"),
  messageBox: document.querySelector("#messageBox"),
  battleFishImage: document.querySelector("#battleFishImage"),
  enemyHpPanel: document.querySelector("#enemyHpPanel"),
  enemyHpName: document.querySelector("#enemyHpName"),
  enemyHpText: document.querySelector("#enemyHpText"),
  enemyHpFill: document.querySelector("#enemyHpFill"),
  enemyRarity: document.querySelector("#enemyRarity"),
  areaBadge: document.querySelector("#areaBadge"),
  bonusCount: document.querySelector("#bonusCount"),
  bonusToast: document.querySelector("#bonusToast"),
  questionText: document.querySelector("#questionText"),
  answerList: document.querySelector("#answerList"),
  resultText: document.querySelector("#resultText"),
  caughtCount: document.querySelector("#caughtCount"),
  soundToggle: document.querySelector("#soundToggle"),
  resetButton: document.querySelector("#resetButton"),
  hiraganaToggle: document.querySelector("#hiraganaToggle"),
  nameOnlyToggle: document.querySelector("#nameOnlyToggle"),
  bgmToggle: document.querySelector("#bgmToggle"),
};

const ctx = elements.canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const state = {
  mode: "map",
  selectedArea: "port",
  currentMap: "port",
  player: { ...playerStart },
  facing: "down",
  stepCount: 0,
  encounterCooldown: 0,
  currentFish: null,
  currentQuiz: null,
  currentHp: 0,
  maxHp: 0,
  nameRevealed: false,
  wrongCount: 0,
  soundOn: true,
  audio: null,
  bgm: null,
  bgmMode: null,
  sfx: {},
  frame: 0,
  bonus: Number(localStorage.getItem("mfq-bonus") || "0"),
  save: JSON.parse(localStorage.getItem("mfq-save") || "{}"),
  abilities: { surf: false, light: false, cut: false, reeds: false, dive: false, ugan: false },
  cleared: {},
  // ゲート解除時の消失アニメ（その場で1つだけ進行。frameEnd到達で消える）。
  gateFx: null,
  dexQuery: "",
  dexRarity: "all",
  dexCategory: "all",
  dexKingdom: "all",
  dexArea: "all",
  selectedDexFishId: null,
  dexDetailOpen: false,
  dexFilterOpen: false,
  dexOpenGroup: null,
  wide: false,
  // 設定（それぞれ独立。localStorageに保存）。
  hiraganaMode: false,
  nameOnlyMode: false,
  bgmOn: true,
  lastMessage: "",
};

// 設定を localStorage から読み込む（後方互換のためデフォルト値でフォールバック）。
(function loadSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("mfq-settings") || "{}");
  } catch (_) {
    saved = {};
  }
  state.hiraganaMode = !!saved.hiraganaMode;
  state.nameOnlyMode = !!saved.nameOnlyMode;
  state.bgmOn = saved.bgmOn === undefined ? true : !!saved.bgmOn;
})();

function saveSettings() {
  localStorage.setItem("mfq-settings", JSON.stringify({
    hiraganaMode: state.hiraganaMode,
    nameOnlyMode: state.nameOnlyMode,
    bgmOn: state.bgmOn,
  }));
}

// カタカナをひらがなに変換する（kuromojiの読み[カタカナ]→ひらがな用）。
function toHiragana(text) {
  return String(text).replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

const KANJI_RE = /[一-鿿々〆]/;
function hasKanji(text) {
  return KANJI_RE.test(text);
}

// kuromoji（日本語形態素解析）を遅延ロードする。ひらがなモードを使う時だけ取得。
let kuromojiTokenizer = null;
let kuromojiLoading = false;
const hiraganaCache = new Map();

function ensureTokenizer() {
  if (kuromojiTokenizer || kuromojiLoading) return;
  if (typeof kuromoji === "undefined") return; // ライブラリ未ロード
  kuromojiLoading = true;
  kuromoji
    .builder({ dicPath: "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/" })
    .build((err, tokenizer) => {
      kuromojiLoading = false;
      if (err) {
        console.error("kuromojiの読み込みに失敗:", err);
        return;
      }
      kuromojiTokenizer = tokenizer;
      refreshLocalizedText();
    });
}

// 漢字だけをひらがな読みに変換する。カタカナ・英数・記号はそのまま。
function kanjiToHiragana(text) {
  if (!hasKanji(text)) return text;
  if (!kuromojiTokenizer) {
    ensureTokenizer();
    return text; // 解析器が準備できるまでは原文（準備後に再描画）。
  }
  if (hiraganaCache.has(text)) return hiraganaCache.get(text);
  let result;
  try {
    result = kuromojiTokenizer
      .tokenize(text)
      .map((token) => {
        if (hasKanji(token.surface_form) && token.reading && token.reading !== "*") {
          return toHiragana(token.reading);
        }
        return token.surface_form;
      })
      .join("");
  } catch (_) {
    result = text;
  }
  hiraganaCache.set(text, result);
  return result;
}

// ひらがなモードが有効なら、HTMLタグを保ったまま漢字部分だけをひらがなに変換する。
function localizeText(text) {
  if (!state.hiraganaMode) return text;
  return String(text).replace(/(<[^>]+>)|([^<]+)/g, (match, tag, plain) =>
    tag ? tag : kanjiToHiragana(plain)
  );
}

// 表示中のメッセージ・クイズをローカライズし直す（モード切替や解析器ロード完了時）。
function refreshLocalizedText() {
  if (typeof state.lastMessage === "string") setMessage(state.lastMessage);
  if (state.mode === "quiz" && state.currentQuiz) renderQuiz();
}

// PC（横長）レイアウトとスマホ（縦長）レイアウトを切り替える。
const wideLayoutQuery = window.matchMedia("(min-width: 981px)");

function applyLayout() {
  const wide = wideLayoutQuery.matches;
  state.wide = wide;
  const targetW = wide ? WIDE_CANVAS_W : MAP_W;
  if (elements.canvas.width !== targetW) elements.canvas.width = targetW;
  if (elements.canvas.height !== MAP_H) elements.canvas.height = MAP_H;
  // canvasのサイズを変更するとコンテキスト状態がリセットされるため再設定する。
  ctx.imageSmoothingEnabled = false;
  // レイアウト変更時は地形キャッシュを無効化（次のdrawMapで再構築）。
  terrainCache.mapId = null;
}

function ensureFishSave(fishId) {
  if (!state.save[fishId]) {
    state.save[fishId] = { caught: 0, correct: 0, seen: 0 };
  }
  return state.save[fishId];
}

function persist() {
  localStorage.setItem("mfq-save", JSON.stringify(state.save));
  localStorage.setItem("mfq-bonus", String(state.bonus));
  renderDex();
  renderBonus();
}

// 秘伝技の所持状況を state.save (__abilities) から読み込む。
function loadAbilities() {
  const a = state.save.__abilities || {};
  state.abilities = { surf: !!a.surf, light: !!a.light, cut: !!a.cut, reeds: !!a.reeds, dive: !!a.dive, ugan: !!a.ugan };
}
// ゲート解除済みフラグを state.save (__cleared) から読み込む。
function loadCleared() {
  state.cleared = { ...(state.save.__cleared || {}) };
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function maxHpFor(fish) {
  if (fish.rarity === "legendary") return 7;
  if (fish.rarity === "rare") return 5;
  if (fish.rarity === "uncommon") return 4;
  return 3;
}

function rewardFor(fish) {
  if (fish.rarity === "legendary") return 300;
  if (fish.rarity === "rare") return 80;
  if (fish.rarity === "uncommon") return 35;
  return 15;
}

// レア度の表示ラベル。legendaryは「伝説」、それ以外は英大文字表記。
function rarityLabel(rarity) {
  return rarity === "legendary" ? "伝説" : String(rarity).toUpperCase();
}

function renderBonus() {
  elements.bonusCount.textContent = `うみコイン ${state.bonus}`;
}

function showBonus(amount) {
  elements.bonusToast.textContent = `+${amount} うみコイン`;
  elements.bonusToast.classList.remove("hidden");
  elements.bonusToast.style.animation = "none";
  void elements.bonusToast.offsetWidth;
  elements.bonusToast.style.animation = "";
  setTimeout(() => elements.bonusToast.classList.add("hidden"), 950);
}

function playSfx(name, volume = 0.55) {
  if (!state.soundOn || !sfxSources[name]) return;
  if (!state.sfx[name]) {
    state.sfx[name] = new Audio(sfxSources[name]);
  }
  const sound = state.sfx[name].cloneNode();
  sound.volume = volume;
  sound.play().catch(() => {});
}

function triggerBattleFlash() {
  document.body.classList.remove("battle-flash");
  void document.body.offsetWidth;
  document.body.classList.add("battle-flash");
  setTimeout(() => document.body.classList.remove("battle-flash"), 560);
}

function syncBattleClass() {
  document.body.classList.toggle("battle-active", state.mode !== "map" && Boolean(state.currentFish));
}

function updateBattleOverlay() {
  syncBattleClass();
  const fish = state.currentFish;
  if (!fish || state.mode === "map") {
    elements.battleFishImage.classList.add("hidden");
    elements.enemyHpPanel.classList.add("hidden");
    elements.areaBadge.classList.add("hidden");
    elements.bonusToast.classList.add("hidden");
    elements.messageBox.classList.remove("battle-hidden");
    return;
  }

  const areaName = areas.find((area) => area.id === state.selectedArea).name;
  if (elements.battleFishImage.src !== fish.image) {
    elements.battleFishImage.src = fish.image;
  }
  elements.battleFishImage.alt = fish.name;
  elements.battleFishImage.classList.remove("hidden");
  elements.enemyHpPanel.classList.remove("hidden");
  elements.areaBadge.classList.remove("hidden");
  elements.messageBox.classList.add("battle-hidden");
  elements.enemyHpName.textContent = state.nameRevealed ? fish.name : "???";
  elements.enemyRarity.textContent = fish.rarity.charAt(0).toUpperCase();
  elements.enemyRarity.title = fish.rarity.toUpperCase();
  const rarityClass = fish.rarity === "legendary" ? "legendary" : fish.rarity === "rare" ? "rare" : "";
  elements.enemyRarity.className = `enemy-rarity ${rarityClass}`.trim();
  elements.areaBadge.textContent = areaName;
  elements.enemyHpText.textContent = `HP ${state.currentHp} / ${state.maxHp}`;
  const ratio = state.maxHp > 0 ? Math.max(0, state.currentHp / state.maxHp) : 0;
  elements.enemyHpFill.style.width = `${ratio * 100}%`;
  elements.enemyHpFill.classList.toggle("low", ratio <= 0.35);
}

function fishDisplayName() {
  return state.nameRevealed && state.currentFish ? state.currentFish.name : "この魚";
}

function getCurrentArea() {
  return areas.find((area) => area.id === state.currentMap);
}

function isWalkableTile(mapId, x, y) {
  return WALKABLE.has(tileAt(mapId, x, y));
}

// マップ毎に「セル文字列キー → gate」の索引を一度だけ構築（複数マスのcellsを高速判定）。
const gateCellIndex = {};
for (const [mapId, gates] of Object.entries(GATES)) {
  const idx = new Map();
  for (const g of gates) {
    for (const [cx, cy] of g.cells) idx.set(`${cx},${cy}`, g);
  }
  gateCellIndex[mapId] = idx;
}

// (x,y) を cells に含むゲートを返す（無ければ undefined）。
function gateAt(mapId, x, y) {
  return gateCellIndex[mapId]?.get(`${x},${y}`);
}

function isBlocked(x, y) {
  const m = state.currentMap;
  if (!isWalkableTile(m, x, y)) return true; // 地形が非歩行(LAND/ROCK)
  const g = gateAt(m, x, y);
  if (g && !state.cleared[g.id]) return true; // 未解除ゲートは壁
  return false;
}

// エリア解放判定。手前のゲートが全て解除されていれば true。
function isAreaUnlocked(areaId) {
  if (areaId === "port" || areaId === "beach") return true;
  if (areaId === "reef") return !!state.cleared.g_beach_drift;
  if (areaId === "offshore") return !!state.cleared.g_beach_drift && !!state.cleared.g_reef_surge;
  if (areaId === "mangrove") return !!state.abilities.reeds;
  if (areaId === "bluehole") return !!state.abilities.surf && !!state.abilities.light && !!state.abilities.dive;
  if (areaId === "ogami") return !!state.abilities.reeds && !!state.abilities.ugan;
  return true;
}

function tryClearGate(g) {
  const ab = ABILITIES[g.ability];
  const label = OBSTACLE_LABEL[g.type];
  if (state.abilities[g.ability]) {
    state.cleared[g.id] = true;
    state.save.__cleared = { ...(state.save.__cleared || {}), [g.id]: true };
    persist();
    playSfx("capture", 0.6);
    setMessage(`${ab.name}をつかった！ ${label}をのりこえた。`);
    // その場で「消えるエフェクト」を起動（cells全マスで消失。解除した瞬間のみ・リロード後は出さない）。
    state.gateFx = { id: g.id, cells: g.cells, type: g.type, start: state.frame, dur: 42 };
  } else {
    playSfx("wrong", 0.5);
    setMessage(`${label}が道をふさいでいる。「${ab.name}」が必要だ。`);
  }
}

function pickWeightedFish(areaId) {
  const pool = fishData.filter((fish) => fish.areas.includes(areaId));
  // プール空のガード: 該当エリアに魚がいなければ全fishから1匹返す(クラッシュ防止)。
  if (!pool.length) {
    return fishData[Math.floor(Math.random() * fishData.length)] || null;
  }
  const weighted = pool.flatMap((fish) => {
    if (fish.rarity === "legendary") return [fish]; // 最も稀(rareと同等以下)
    if (fish.rarity === "rare") return [fish];
    if (fish.rarity === "uncommon") return [fish, fish, fish];
    return [fish, fish, fish, fish, fish];
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

// クイズの選択肢に使う値。category は categoryName を答えにする。
function quizValue(fish, key) {
  if (key === "category") return fish.categoryName;
  return fish[key];
}

function buildQuiz(fish, options = {}) {
  const allowed = Array.isArray(fish.quizFacts) && fish.quizFacts.length
    ? fish.quizFacts
    : ["name", "category", "habitat", "behavior", "feature"];
  let availableQuizTypes = quizTypes.filter((quiz) => {
    if (!allowed.includes(quiz.key)) return false;
    // 中身が空の説明は出題しない（サンゴ・海藻などの diet 空対策）。
    if (!quizValue(fish, quiz.key)) return false;
    if (options.forceName) return quiz.key === "name";
    if (options.skipName) return quiz.key !== "name";
    return true;
  });
  // 名前以外の出題候補が無い場合は名前にフォールバック。
  if (!availableQuizTypes.length) {
    availableQuizTypes = quizTypes.filter((quiz) => quiz.key === "name");
  }
  const quiz = availableQuizTypes[Math.floor(Math.random() * availableQuizTypes.length)];
  const answer = quizValue(fish, quiz.key);

  // まずは同じ大分類から紛らわしい誤答を集め、足りなければ全体から補う。
  const sameGroup = fishData.filter(
    (item) => item.id !== fish.id && item.kingdomGroup === fish.kingdomGroup
  );
  const others = fishData.filter(
    (item) => item.id !== fish.id && item.kingdomGroup !== fish.kingdomGroup
  );
  const pool = [...shuffle(sameGroup), ...shuffle(others)];
  const wrongAnswers = [];
  const used = new Set([answer]);
  for (const item of pool) {
    const value = quizValue(item, quiz.key);
    if (!value || used.has(value)) continue;
    used.add(value);
    wrongAnswers.push(value);
    if (wrongAnswers.length === 3) break;
  }

  return {
    type: quiz,
    answer,
    choices: shuffle([answer, ...wrongAnswers]),
  };
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function setMessage(message) {
  state.lastMessage = message;
  elements.messageBox.innerHTML = localizeText(message);
}

function updateAreaStatus() {
  const area = getCurrentArea();
  state.selectedArea = area.id;
  elements.areaStatus.textContent = area.name;
  renderAreas();
}

function renderAreas() {
  elements.areaList.innerHTML = areas
    .map((area) => {
      const selected = area.id === state.selectedArea ? "selected" : "";
      return `
        <button class="area-button ${selected}" type="button" data-area="${area.id}">
          <strong>${area.name}</strong>
          <span>${area.description}</span>
        </button>
      `;
    })
    .join("");
}

// 1匹分の画像タイル。未捕獲はシルエット＋「？」。
function dexTileHTML(fish) {
  const record = state.save[fish.id] || { caught: 0, correct: 0, seen: 0 };
  const locked = record.caught === 0;
  const selected = fish.id === state.selectedDexFishId ? "selected" : "";
  const label = locked ? "？？？" : fish.name;
  return `
    <button class="dex-tile selectable ${locked ? "locked" : ""} ${selected}" type="button" data-fish-id="${fish.id}" aria-label="${locked ? "未捕獲の魚" : fish.name}">
      <span class="dex-tile-img">
        <img src="${fish.thumb}" alt="${locked ? "" : fish.name}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'" />
        ${locked ? '<span class="dex-tile-lock" aria-hidden="true">？</span>' : ""}
      </span>
      <span class="dex-tile-name">${label}</span>
    </button>
  `;
}

function groupFishMap(list) {
  const grouped = new Map();
  list.forEach((fish) => {
    if (!grouped.has(fish.kingdomGroup)) grouped.set(fish.kingdomGroup, []);
    grouped.get(fish.kingdomGroup).push(fish);
  });
  return grouped;
}

// 1階層目：グループを「集めるアルバム」のカードとして並べる。
// 代表画像＋進捗バーで、どのグループを埋めたいかが一目で分かるようにする。
function renderDexAlbum() {
  const grouped = groupFishMap(fishData);
  return getKingdomGroups()
    .filter((group) => grouped.has(group))
    .map((group) => {
      const groupFish = grouped.get(group);
      const caught = groupFish.filter((fish) => state.save[fish.id]?.caught > 0).length;
      const total = groupFish.length;
      const percent = Math.round((caught / total) * 100);
      const allLocked = caught === 0;
      const complete = caught === total;
      const rep = groupFish.find((fish) => state.save[fish.id]?.caught > 0) || groupFish[0];
      return `
        <button class="dex-group-card ${allLocked ? "locked" : ""} ${complete ? "complete" : ""}" type="button" data-group="${group}">
          <span class="dex-group-card-img">
            <img src="${rep.thumb}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'" />
            ${allLocked ? '<span class="dex-tile-lock" aria-hidden="true">？</span>' : ""}
            ${complete ? '<span class="dex-group-card-badge" aria-hidden="true">★</span>' : ""}
          </span>
          <span class="dex-group-card-body">
            <span class="dex-group-card-name">${group}</span>
            <span class="dex-group-card-count">${caught} / ${total}</span>
            <span class="dex-progress"><span class="dex-progress-fill" style="width:${percent}%"></span></span>
          </span>
        </button>
      `;
    })
    .join("");
}

// グループ見出し＋件数のセクションに、魚タイルのグリッドを敷く（検索結果や2階層目で共用）。
function renderDexSections(list) {
  const grouped = groupFishMap(list);
  return getKingdomGroups()
    .filter((group) => grouped.has(group))
    .map((group) => {
      const groupFish = grouped.get(group);
      const caught = groupFish.filter((fish) => state.save[fish.id]?.caught > 0).length;
      return `
        <section class="dex-group">
          <header class="dex-group-head">
            <span class="dex-group-name">${group}</span>
            <span class="dex-group-count">${caught} / ${groupFish.length}</span>
          </header>
          <div class="dex-group-grid">${groupFish.map(dexTileHTML).join("")}</div>
        </section>
      `;
    })
    .join("");
}

function renderDex() {
  const caught = fishData.filter((fish) => state.save[fish.id]?.caught > 0).length;
  elements.caughtCount.textContent = `${caught} / ${fishData.length}`;
  if (!state.selectedDexFishId) state.selectedDexFishId = fishData[0]?.id || null;

  const query = state.dexQuery.trim();
  const filtering = query !== "" || state.dexRarity !== "all"
    || state.dexKingdom !== "all" || state.dexArea !== "all" || state.dexCategory !== "all";

  if (filtering) {
    // 検索・絞り込み中はアルバムを飛ばし、ヒットした魚を直接タイルで見せる。
    const filteredFish = getFilteredFish();
    elements.dexList.innerHTML = filteredFish.length
      ? `<p class="dex-result-head">${query ? `「${query}」の` : ""}該当 ${filteredFish.length}件</p>${renderDexSections(filteredFish)}`
      : `<p class="dex-empty">条件に合う魚がいません。検索語やフィルタを変えてください。</p>`;
  } else if (state.dexOpenGroup) {
    // 2階層目：選んだグループの中身。
    const groupFish = fishData.filter((fish) => fish.kingdomGroup === state.dexOpenGroup);
    const groupCaught = groupFish.filter((fish) => state.save[fish.id]?.caught > 0).length;
    elements.dexList.innerHTML = `
      <div class="dex-subhead">
        <button class="dex-back" type="button" data-dex-back>‹ もどる</button>
        <span class="dex-subhead-name">${state.dexOpenGroup}</span>
        <span class="dex-subhead-count">${groupCaught} / ${groupFish.length}</span>
      </div>
      <div class="dex-group-grid">${groupFish.map(dexTileHTML).join("")}</div>
    `;
  } else {
    // 1階層目：グループのアルバムカード。
    elements.dexList.innerHTML = `<div class="dex-group-cards">${renderDexAlbum()}</div>`;
  }

  if (state.dexDetailOpen) renderDexDetail();
  renderDexFilters();
}

function getFilteredFish() {
  const query = state.dexQuery.trim().toLowerCase();
  return fishData.filter((fish) => {
    if (state.dexKingdom !== "all" && fish.kingdomGroup !== state.dexKingdom) return false;
    if (state.dexRarity !== "all" && fish.rarity !== state.dexRarity) return false;
    if (state.dexCategory !== "all" && fish.categoryId !== state.dexCategory) return false;
    if (state.dexArea !== "all" && !fish.areas.includes(state.dexArea)) return false;
    if (!query) return true;
    const text = [
      fish.name,
      fish.localName,
      fish.scientific,
      fish.rarity,
      fish.kingdomGroup,
      fish.family,
      fish.categoryName,
      fish.categoryNote,
      fish.habitat,
      fish.diet,
      fish.behavior,
      fish.feature,
      fish.danger,
      fishAreasText(fish),
    ].join(" ").toLowerCase();
    return text.includes(query);
  });
}

function getFishCategories() {
  const categories = new Map();
  fishData.forEach((fish) => {
    // 大分類フィルタが効いているときは、その分類だけ並べる。
    if (state.dexKingdom !== "all" && fish.kingdomGroup !== state.dexKingdom) return;
    if (!categories.has(fish.categoryId)) {
      categories.set(fish.categoryId, fish.categoryName);
    }
  });
  return [...categories.entries()].map(([id, name]) => ({ id, name }));
}

function getKingdomGroups() {
  const present = new Set(fishData.map((fish) => fish.kingdomGroup));
  return kingdomGroups.filter((group) => present.has(group));
}

function fishAreasText(fish) {
  return fish.areas
    .map((areaId) => areas.find((area) => area.id === areaId)?.name)
    .filter(Boolean)
    .join("・");
}

function fishHabitNote(fish) {
  return `${fish.name}は${fish.categoryName}の仲間。${fish.categoryNote}${fish.habitat}${fish.diet}${fish.behavior} ${fish.feature} 危険度や扱いの目安は「${fish.danger}」。`;
}

function renderDexDetail() {
  const fish = fishData.find((item) => item.id === state.selectedDexFishId) || fishData[0];
  if (!fish) return;
  const record = state.save[fish.id] || { caught: 0, correct: 0, seen: 0 };
  const locked = record.caught === 0;
  const level = Math.min(4, record.correct);
  const title = locked ? "未捕獲" : `${fish.name}（${fish.localName}）`;
  const subtitle = locked
    ? `${fish.categoryName} / ${rarityLabel(fish.rarity)} / 遭遇 ${record.seen || 0}回`
    : `${fish.categoryName} / 知識Lv.${level} / 捕獲${record.caught} / 正解${record.correct}`;
  const detailBody = locked
    ? `<p class="dex-hint">捕獲すると、おもしろ習性・すみか・食べもの・行動がここに記録される。</p>`
    : `
      <p class="dex-feature">${fish.feature}</p>
      <p class="dex-habit-note">${fishHabitNote(fish)}</p>
      <dl class="dex-detail">
        <div><dt>レア度</dt><dd>${rarityLabel(fish.rarity)}</dd></div>
        <div><dt>大分類</dt><dd>${fish.kingdomGroup}</dd></div>
        <div><dt>分類</dt><dd>${fish.categoryName}。${fish.categoryNote}</dd></div>
        <div><dt>HP</dt><dd>${maxHpFor(fish)}</dd></div>
        <div><dt>出現</dt><dd>${fishAreasText(fish)}</dd></div>
        <div><dt>すみか</dt><dd>${fish.habitat}</dd></div>
        ${fish.diet ? `<div><dt>食べもの</dt><dd>${fish.diet}</dd></div>` : ""}
        <div><dt>行動</dt><dd>${fish.behavior}</dd></div>
        <div><dt>注意</dt><dd>${fish.danger}</dd></div>
        <div><dt>学名</dt><dd>${fish.scientific}</dd></div>
      </dl>
      ${fish.imageAttribution ? `<p class="dex-credit">画像: ${fish.imageAttribution}${fish.imageLicense ? `（${fish.imageLicense}）` : ""} via iNaturalist</p>` : ""}
    `;

  elements.dexDetailPanel.innerHTML = `
    <button class="dex-sheet-close" type="button" data-dex-close aria-label="詳細を閉じる">×</button>
    <div class="dex-detail-hero ${locked ? "locked" : ""}">
      <img src="${fish.image}" alt="${fish.name}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'" />
      <div>
        <h3>${title}</h3>
        <p>${subtitle}</p>
        <div class="dex-meta-row">
          <span class="dex-pill dex-pill-rarity rarity-${fish.rarity}">${rarityLabel(fish.rarity)}</span>
          <span class="dex-pill">${fish.categoryName}</span>
          <span class="dex-pill">HP ${maxHpFor(fish)}</span>
          <span class="dex-pill">${fishAreasText(fish)}</span>
        </div>
      </div>
    </div>
    ${detailBody}
  `;
  elements.dexDetailScrim.classList.remove("hidden");
  elements.dexDetailPanel.classList.remove("hidden");
}

function renderDexFilters() {
  const buttons = elements.dexFilterList.querySelectorAll("[data-rarity]");
  buttons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.rarity === state.dexRarity);
  });

  if (elements.dexKingdomList) {
    elements.dexKingdomList.innerHTML = [
      `<button class="dex-filter-button ${state.dexKingdom === "all" ? "selected" : ""}" type="button" data-kingdom="all">全グループ</button>`,
      ...getKingdomGroups().map((group) => (
        `<button class="dex-filter-button ${state.dexKingdom === group ? "selected" : ""}" type="button" data-kingdom="${group}">${group}</button>`
      )),
    ].join("");
  }

  if (elements.dexAreaList) {
    elements.dexAreaList.innerHTML = [
      `<button class="dex-filter-button ${state.dexArea === "all" ? "selected" : ""}" type="button" data-dex-area="all">全エリア</button>`,
      ...areas.map((area) => (
        `<button class="dex-filter-button ${state.dexArea === area.id ? "selected" : ""}" type="button" data-dex-area="${area.id}">${area.name}</button>`
      )),
    ].join("");
  }

  elements.dexCategoryList.innerHTML = [
    `<button class="dex-filter-button ${state.dexCategory === "all" ? "selected" : ""}" type="button" data-category="all">全分類</button>`,
    ...getFishCategories().map((category) => {
      // その分類の魚をすべて捕獲済みなら、ピルにコンプリートの印を出す。
      const list = fishData.filter((fish) => fish.categoryId === category.id);
      const complete = list.length > 0 && list.every((fish) => state.save[fish.id]?.caught > 0);
      return `<button class="dex-filter-button ${complete ? "complete" : ""} ${state.dexCategory === category.id ? "selected" : ""}" type="button" data-category="${category.id}">${category.name}${complete ? '<span class="dex-pill-complete" aria-hidden="true">★</span>' : ""}</button>`;
    }),
  ].join("");

  // 何かしら絞り込みが効いていればトグルに印を出し、閉じていても気づけるようにする。
  if (elements.dexFilterToggle) {
    const hasActive = state.dexRarity !== "all" || state.dexKingdom !== "all"
      || state.dexArea !== "all" || state.dexCategory !== "all";
    elements.dexFilterToggle.classList.toggle("has-active", hasActive);
  }
}

function setDexFilterOpen(open) {
  state.dexFilterOpen = open;
  elements.dexFilterPopup.classList.toggle("hidden", !open);
  if (elements.dexFilterToggle) {
    elements.dexFilterToggle.setAttribute("aria-expanded", String(open));
    elements.dexFilterToggle.classList.toggle("open", open);
  }
}

function openDexScreen() {
  playSfx("menu", 0.42);
  elements.dexScreen.classList.remove("hidden");
  elements.menuPanel.classList.add("hidden");
  state.dexOpenGroup = null;
  renderDex();
}

function closeDexScreen() {
  playSfx("menu", 0.34);
  closeDexDetail(false);
  setDexFilterOpen(false);
  elements.dexScreen.classList.add("hidden");
}

// ---- うみコインショップ ----

const ABILITY_ICONS = { surf: "🌊", light: "🔦", cut: "⚔️", reeds: "🌿", dive: "🤿", ugan: "⛩️" };

function renderShop() {
  elements.shopBalance.textContent = `うみコイン ${state.bonus}`;
  elements.shopList.innerHTML = Object.values(ABILITIES)
    .map((ab) => {
      const owned = !!state.abilities[ab.id];
      const canAfford = state.bonus >= ab.price;
      const icon = ABILITY_ICONS[ab.id] || "✨";
      let btnLabel, btnDisabled;
      if (owned) {
        btnLabel = "所持ずみ";
        btnDisabled = true;
      } else if (!canAfford) {
        btnLabel = "コインが足りない";
        btnDisabled = true;
      } else {
        btnLabel = "交換する";
        btnDisabled = false;
      }
      return `
      <div class="shop-card">
        <div class="shop-card-header">
          <span class="shop-card-icon" aria-hidden="true">${icon}</span>
          <span class="shop-card-name">${ab.name}</span>
          <span class="shop-card-price">🪙 ${ab.price}</span>
        </div>
        <p class="shop-card-desc">${ab.desc}</p>
        <button class="shop-card-buy" type="button" data-buy="${ab.id}"${btnDisabled ? " disabled" : ""}>${btnLabel}</button>
      </div>`;
    })
    .join("");
}

function openShop() {
  playSfx("menu", 0.42);
  elements.shopScreen.classList.remove("hidden");
  elements.menuPanel.classList.add("hidden");
  renderShop();
}

function closeShop() {
  playSfx("menu", 0.34);
  elements.shopScreen.classList.add("hidden");
}

function buyAbility(id) {
  const ab = ABILITIES[id];
  if (!ab) return;
  if (state.abilities[id]) return;
  if (state.bonus < ab.price) return;
  state.bonus -= ab.price;
  state.abilities[id] = true;
  if (!state.save.__abilities) state.save.__abilities = {};
  state.save.__abilities[id] = true;
  persist();
  playSfx("coin", 0.6);
  setMessage(`「${ab.name}」を手に入れた！ ${ab.desc}。`);
  renderShop();
}

function openDexDetail(fishId) {
  state.selectedDexFishId = fishId;
  state.dexDetailOpen = true;
  renderDex();
}

function closeDexDetail(withSound = true) {
  if (!state.dexDetailOpen && elements.dexDetailPanel.classList.contains("hidden")) return;
  if (withSound) playSfx("menu", 0.28);
  state.dexDetailOpen = false;
  elements.dexDetailScrim.classList.add("hidden");
  elements.dexDetailPanel.classList.add("hidden");
}

function movePlayer(direction) {
  if (state.mode !== "map") return;
  unlockAudio();
  playMapBgm();
  const delta = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  }[direction];

  state.facing = direction;
  const rawX = state.player.x + delta.x;
  const rawY = state.player.y + delta.y;
  if (rawX < 0 || rawX >= mapCols || rawY < 0 || rawY >= mapRows) {
    transferMap(direction);
    return;
  }
  const gate = gateAt(state.currentMap, rawX, rawY);
  if (gate && !state.cleared[gate.id]) {
    tryClearGate(gate);
    return;
  }
  if (isBlocked(rawX, rawY)) {
    setMessage("その先は進めない。別の道を探そう。");
    return;
  }
  const nextX = rawX;
  const nextY = rawY;
  if (nextX === state.player.x && nextY === state.player.y) return;

  state.player.x = nextX;
  state.player.y = nextY;
  state.stepCount += 1;
  state.encounterCooldown = Math.max(0, state.encounterCooldown - 1);
  updateAreaStatus();
  setMessage(`${getCurrentArea().name}を探索中。海面がざわついている。`);

  if (state.encounterCooldown === 0 && state.stepCount > 2 && Math.random() < encounterChanceForArea(state.selectedArea)) {
    startEncounter();
  }
}

function transferMap(direction) {
  const nextMap = mapDefinitions[state.currentMap].exits[direction];
  if (!nextMap) {
    setMessage("ここから先には進めない。");
    return;
  }
  state.currentMap = nextMap;
  if (direction === "right") {
    state.player.x = 0;
    state.player.y = Math.min(Math.max(state.player.y, 1), mapRows - 2);
  } else if (direction === "left") {
    state.player.x = mapCols - 1;
    state.player.y = Math.min(Math.max(state.player.y, 1), mapRows - 2);
  } else if (direction === "down") {
    state.player.x = Math.min(Math.max(state.player.x, 1), mapCols - 2);
    state.player.y = 0;
  } else if (direction === "up") {
    state.player.x = Math.min(Math.max(state.player.x, 1), mapCols - 2);
    state.player.y = mapRows - 1;
  }
  state.encounterCooldown = 3;
  updateAreaStatus();
  playSfx("run", 0.36);
  setMessage(`${getCurrentArea().name}へ移動した。`);
  playMapBgm();
}

function encounterChanceForArea(areaId) {
  if (areaId === "ogami") return 0.30;
  if (areaId === "bluehole") return 0.30;
  if (areaId === "offshore") return 0.26;
  if (areaId === "reef") return 0.22;
  if (areaId === "mangrove") return 0.20;
  return 0.16;
}

function startEncounter() {
  const fish = pickWeightedFish(state.selectedArea);
  const record = ensureFishSave(fish.id);
  const registered = record.caught > 0;
  state.mode = "encounter";
  state.currentFish = fish;
  state.currentQuiz = null;
  state.maxHp = maxHpFor(fish);
  state.currentHp = state.maxHp;
  state.nameRevealed = registered;
  state.wrongCount = 0;
  state.encounterCooldown = 4;
  record.seen += 1;
  persist();

  hideQuiz();
  elements.commandPanel.classList.remove("hidden");
  updateBattleOverlay();
  const special = fish.rarity === "rare" || fish.rarity === "legendary";
  playSfx(special ? "rareEncounter" : "encounter", fish.rarity === "legendary" ? 0.8 : special ? 0.68 : 0.52);
  if (fish.rarity === "legendary") {
    setMessage("海の主が あらわれた！ ただならぬ気配が あたりを包む。");
  } else {
    setMessage(`${fish.rarity === "rare" ? "めずらしい気配！ " : ""}なにかの魚が とびだしてきた！`);
  }
  playBattleBgm(fish.rarity === "legendary" ? "legendary" : special ? "rare" : "normal");
}

function handleCommand(command) {
  unlockAudio();
  if (!state.currentFish) return;
  playSfx("select", 0.42);

  if (command === "fight") {
    state.mode = "quiz";
    elements.commandPanel.classList.add("hidden");
    const record = ensureFishSave(state.currentFish.id);
    state.currentQuiz = buildQuiz(state.currentFish, state.nameOnlyMode
      ? { forceName: true }
      : {
          forceName: record.caught === 0 && !state.nameRevealed,
          skipName: record.caught > 0 || state.nameRevealed,
        });
    renderQuiz();
    setMessage(state.currentQuiz.type.key === "name" ? "まずは名前を見きわめよう。" : `${state.currentFish.name}の習性を見きわめろ！`);
    return;
  }

  if (command === "observe") {
    const fish = state.currentFish;
    const observeNote = fish.rarity === "legendary" ? "圧倒的な存在感だ。心して見きわめろ。" : fish.rarity === "rare" ? "動きが鋭い。" : "落ち着いて見れば特徴がわかりそうだ。";
    setMessage(`${state.nameRevealed ? fish.name : "この魚"}を観察した。${observeNote}`);
    return;
  }

  playSfx("run", 0.5);
  endEncounter(`${state.nameRevealed ? state.currentFish.name : "魚"}から はなれた。探索にもどろう。`);
}

function renderQuiz() {
  const fish = state.currentFish;
  const quiz = state.currentQuiz;

  elements.quizPanel.classList.remove("correct-scroll", "next-scroll");
  elements.quizPanel.classList.remove("hidden");
  const rawQuestion = quiz.type.question(fish);
  const question = state.nameRevealed || quiz.type.key === "name"
    ? rawQuestion
    : rawQuestion.replaceAll(fish.name, "この魚");
  elements.questionText.textContent = localizeText(question);
  elements.resultText.textContent = "";
  elements.answerList.innerHTML = quiz.choices
    .map((choice) => `<button class="answer-button" type="button" data-answer="${escapeHtml(choice)}">${escapeHtml(localizeText(choice))}</button>`)
    .join("");
}

function transitionToNextQuiz() {
  state.mode = "transition";
  elements.quizPanel.classList.add("correct-scroll");

  setTimeout(() => {
    if (state.mode !== "transition" || !state.currentFish) return;
    const record = ensureFishSave(state.currentFish.id);
    state.currentQuiz = buildQuiz(state.currentFish, state.nameOnlyMode
      ? { forceName: true }
      : {
          forceName: record.caught === 0 && !state.nameRevealed,
          skipName: record.caught > 0 || state.nameRevealed,
        });
    state.mode = "quiz";
    renderQuiz();
    elements.quizPanel.classList.add("next-scroll");
    setMessage(`${fishDisplayName()}はまだ元気だ。次の問題に答えよう。あと${state.currentHp}回。`);
    setTimeout(() => elements.quizPanel.classList.remove("next-scroll"), 460);
  }, 540);
}

function answer(choice, button) {
  if (state.mode !== "quiz") return;
  const fish = state.currentFish;
  const correct = choice === state.currentQuiz.answer;
  const record = ensureFishSave(fish.id);
  const buttons = elements.answerList.querySelectorAll("button");
  buttons.forEach((item) => {
    item.disabled = true;
    if (item.dataset.answer === state.currentQuiz.answer) item.classList.add("correct");
  });

  if (correct) {
    button.classList.add("correct");
    record.correct += 1;
    if (state.currentQuiz.type.key === "name") {
      state.nameRevealed = true;
    }
    state.currentHp = Math.max(0, state.currentHp - 1);
    updateBattleOverlay();
    playSfx("correct", 0.58);
    playSfx("damage", 0.46);
    triggerBattleFlash();

    if (state.currentHp === 0) {
      const reward = rewardFor(fish);
      record.caught += 1;
      state.bonus += reward;
      elements.resultText.innerHTML = localizeText(`正解。${fish.behavior}<br>${fish.name}を捕獲した。`);
      setMessage(`${fish.name}をたおした！ 図鑑に登録して、${reward}うみコインを手に入れた。`);
      persist();
      playSfx("capture", 0.64);
      playSfx("coin", 0.5);
      showBonus(reward);
      state.mode = "result";
      setTimeout(() => {
        if (state.mode === "result") endEncounter("探索にもどった。歩き回るとまた魚に出会える。");
      }, 2600);
      return;
    }

    elements.resultText.innerHTML = localizeText(`正解。${fish.behavior}<br>${fishDisplayName()}のHPが ${state.currentHp} まで下がった。`);
    setMessage(`${fishDisplayName()}にきいた！ HPが少し減った。あと${state.currentHp}回、習性を見きわめよう。`);
    persist();
    transitionToNextQuiz();
  } else {
    button.classList.add("wrong");
    state.wrongCount += 1;
    elements.resultText.textContent = localizeText(`不正解。正解は「${state.currentQuiz.answer}」。`);
    playSfx("wrong", 0.5);
    persist();

    const skittish = fish.rarity === "rare" || fish.rarity === "legendary";
    if (skittish && state.wrongCount >= 2) {
      const lostMsg = fish.rarity === "legendary"
        ? `${fishDisplayName()}は深い淵へと姿を消した。海の主はミスが続くと去ってしまう。`
        : `${fishDisplayName()}に逃げられてしまった。レアな魚はミスが続くと姿を消す。`;
      setMessage(lostMsg);
      state.mode = "result";
      setTimeout(() => {
        if (state.mode === "result") endEncounter("逃げられてしまった。次に出会ったら慎重に答えよう。");
      }, 2200);
      return;
    }

    const rareWarning = skittish ? ` ${fish.rarity === "legendary" ? "海の主" : "レアな魚"}はあと${2 - state.wrongCount}回ミスすると逃げる。` : "";
    setMessage(`${fishDisplayName()}にはきかなかった。HPは減らない。${rareWarning}`);
    state.mode = "result";
    setTimeout(() => {
      if (state.mode !== "result") return;
      state.mode = "encounter";
      hideQuiz();
      elements.commandPanel.classList.remove("hidden");
      setMessage(`${fishDisplayName()}がこちらを見ている。次のアクションを選ぼう。`);
    }, 1800);
  }
}

function hideQuiz() {
  elements.quizPanel.classList.add("hidden");
  elements.quizPanel.classList.remove("correct-scroll", "next-scroll");
  elements.answerList.innerHTML = "";
  elements.resultText.textContent = "";
}

function endEncounter(message) {
  state.mode = "map";
  state.currentFish = null;
  state.currentQuiz = null;
  state.currentHp = 0;
  state.maxHp = 0;
  state.nameRevealed = false;
  state.wrongCount = 0;
  elements.commandPanel.classList.add("hidden");
  hideQuiz();
  updateBattleOverlay();
  setMessage(message);
  playMapBgm();
}

function draw() {
  state.frame += 1;
  if (state.mode === "map") {
    drawMap();
  } else {
    drawBattle();
  }
  requestAnimationFrame(draw);
}

function drawMap() {
  ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

  // (1) 静的地形レイヤをキャッシュ（マップ切替時のみ再構築）し、(2) blit。
  if (terrainCache.mapId !== state.currentMap) buildTerrainCache(state.currentMap);
  ctx.drawImage(terrainCache.canvas, 0, 0);

  // (3) 動的アニメ層（水のきらめき/帯リップル/泡/海藻ゆれ）をライブ描画。
  drawWaterDynamics(state.currentMap);

  // (4) ゲート障害物 (5) 動的装飾(なし) (6) ラベル/プレイヤー。
  drawGates(state.currentMap);
  drawMapLabel();
  drawPlayer();
  drawMinimap();

  if (state.wide) {
    drawInfoPanel(MAP_W, 0, elements.canvas.width - MAP_W, MAP_H);
  }
}

// PC横長レイアウトでcanvas右側に描く情報パネル（探索中のステータス表示）。
function drawInfoPanel(x, y, w, h) {
  const area = getCurrentArea();
  const total = fishData.length;
  const caught = fishData.filter((fish) => state.save[fish.id]?.caught > 0).length;
  const pad = 28;
  const innerX = x + pad;
  const innerW = w - pad * 2;

  // 背景
  ctx.save();
  const bg = ctx.createLinearGradient(x, 0, x, h);
  bg.addColorStop(0, "#0e5f72");
  bg.addColorStop(1, "#0b3f57");
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(x, y, 4, h);

  ctx.textBaseline = "top";
  let cy = 48;

  // タイトル
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "800 15px system-ui";
  ctx.fillText("MIYAKO FISH QUEST", innerX, cy);
  cy += 30;

  // 現在地
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.font = "700 16px system-ui";
  ctx.fillText("現在地", innerX, cy);
  cy += 26;
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 34px system-ui";
  ctx.fillText(area.name, innerX, cy);
  cy += 46;
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = "600 16px system-ui";
  wrapText(area.description, innerX, cy, innerW, 24);
  cy += 64;

  // ステータスカード（図鑑・うみコイン）
  drawStatCard(innerX, cy, innerW, "ずかん", `${caught} / ${total}`, "#34b36b");
  cy += 92;
  drawStatCard(innerX, cy, innerW, "うみコイン", `${state.bonus}`, "#e8c56e");
  cy += 92;

  // 所持わざ
  const ownedAbilities = Object.keys(ABILITIES)
    .filter((id) => state.abilities[id])
    .map((id) => ABILITIES[id].name);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "700 15px system-ui";
  ctx.fillText(
    `所持わざ: ${ownedAbilities.length ? ownedAbilities.join(" / ") : "なし"}`,
    innerX,
    cy
  );
  cy += 30;

  // 操作ヒント
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "600 14px system-ui";
  wrapText(
    "矢印キー / WASD で移動。画面の端から隣のマップへ。海面がざわつくと魚に出会えます。",
    innerX,
    cy,
    innerW,
    22
  );
  ctx.restore();
}

function drawStatCard(x, y, w, label, value, accent) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  roundRect(x, y, w, 72, 14);
  ctx.fill();
  ctx.fillStyle = accent;
  roundRect(x, y, 6, 72, 3);
  ctx.fill();
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255,255,255,0.66)";
  ctx.font = "700 15px system-ui";
  ctx.fillText(label, x + 20, y + 14);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 30px system-ui";
  ctx.fillText(value, x + 20, y + 34);
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const chars = [...text];
  let line = "";
  let cy = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = ch;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy + lineHeight;
}

// 決定的擬似乱数（x,yから。毎フレームちらつかない）。0..2^32-1 を返す。
function pseudo(x, y, salt) {
  let h = (x * 374761393 + y * 668265263 + salt * 2147483647) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = (h * 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}
// 0..1 の決定的乱数。
function prand(x, y, salt) {
  return pseudo(x, y, salt) / 4294967296;
}

// 地形のランク（縁取りの方向決め）。陸/岩>桟橋>砂>サンゴ>海。
function edgeRank(t) {
  switch (t) {
    case T.LAND:
    case T.ROCK:
      return 4;
    case T.PIER:
      return 3;
    case T.SAND:
      return 2;
    case T.REEF:
    case T.CORAL:
      return 1;
    default:
      return 0; // SEA / SHALLOW / DEEP / FOAM
  }
}
function isWaterTile(t) {
  return t === T.SEA || t === T.SHALLOW || t === T.DEEP || t === T.FOAM;
}

// ------------------------------------------------------------------
// オフスクリーン地形キャッシュ（静的レイヤを一度だけ描画して毎フレームblit）。
// ------------------------------------------------------------------
const terrainCache = { mapId: null, canvas: null, gctx: null };

function ensureTerrainCanvas() {
  if (terrainCache.canvas) return;
  const c = document.createElement("canvas");
  c.width = MAP_W;
  c.height = MAP_H;
  terrainCache.canvas = c;
  terrainCache.gctx = c.getContext("2d");
  terrainCache.gctx.imageSmoothingEnabled = false;
}

// マップの静的地形レイヤをオフスクリーンに一括描画。マップ切替時に呼ぶ。
function buildTerrainCache(mapId) {
  ensureTerrainCanvas();
  const g = terrainCache.gctx;
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, MAP_W, MAP_H);
  // 1) ベース地形 2) 境界縁取り 3) 静的装飾、の順に全タイル走査。
  for (let y = 0; y < mapRows; y += 1) {
    for (let x = 0; x < mapCols; x += 1) {
      drawTerrainBase(g, x * tileSize, y * tileSize, x, y, tileAt(mapId, x, y), mapId);
    }
  }
  for (let y = 0; y < mapRows; y += 1) {
    for (let x = 0; x < mapCols; x += 1) {
      drawTerrainEdges(g, x * tileSize, y * tileSize, x, y, mapId, tileAt(mapId, x, y));
    }
  }
  drawStaticDecor(g, mapId);
  terrainCache.mapId = mapId;
}

// グラデ風の縦帯を fillRect で（オフスクリーン用、重くない）。
function vBands(g, px, py, stops) {
  // stops: [[fromRow0..1, color], ...] tile内を上→下に分割塗り。
  const n = stops.length;
  const h = tileSize / n;
  for (let i = 0; i < n; i += 1) {
    g.fillStyle = stops[i];
    g.fillRect(px, py + Math.round(i * h), tileSize, Math.ceil(h) + 1);
  }
}

// ------------------------------------------------------------------
// 静的ベース地形（キャッシュへ描画。g = オフスクリーンctx）。
// ------------------------------------------------------------------
function drawTerrainBase(g, px, py, x, y, t, mapId) {
  switch (t) {
    case T.DEEP: {
      // 濃紺の深場。下ほど濃く。
      vBands(g, px, py, ["#0d4063", "#0b3a5b", "#093251", "#072a47"]);
      // 決定的な暗い深みのムラ（タイル跨ぎで連続する大波模様）。
      if ((x + Math.floor(y / 2)) % 3 === 0) {
        g.fillStyle = "rgba(5,30,55,0.45)";
        g.fillRect(px, py + 6 + (pseudo(x, y, 1) % 12), tileSize, 5);
      }
      break;
    }
    case T.SEA: {
      // ターコイズブルー。
      vBands(g, px, py, ["#1f86b4", "#1c7aa6", "#196f99", "#15648c"]);
      g.fillStyle = "rgba(90,180,210,0.3)";
      if ((x + y) % 2 === 0) g.fillRect(px, py + 4, tileSize, 4);
      break;
    }
    case T.SHALLOW: {
      // 明るいエメラルド。
      vBands(g, px, py, ["#5fd0cf", "#4ec3c4", "#41b7ba", "#36abb0"]);
      g.fillStyle = "rgba(190,245,240,0.34)";
      if ((x + y) % 2 === 1) g.fillRect(px, py + 6, tileSize, 4);
      break;
    }
    case T.FOAM: {
      // 波打ち際の静的ベース（泡アニメは動的層で）。
      vBands(g, px, py, ["#6fc8d2", "#86d4da", "#a9e2e3", "#cdeeea"]);
      g.fillStyle = "rgba(210,180,120,0.4)"; // 濡れ砂が透ける底
      g.fillRect(px, py + tileSize - 5, tileSize, 5);
      break;
    }
    case T.SAND: {
      // ほぼ白いクリーム。下が水際に近いほどやや湿る扱いは縁取りで。
      g.fillStyle = "#f3e8c6";
      g.fillRect(px, py, tileSize, tileSize);
      g.fillStyle = "#efe1b6";
      g.fillRect(px, py + 16, tileSize, 16);
      // 風紋: x基準で連続する波状リップル線（隣タイルと繋がる）。
      g.strokeStyle = "rgba(210,188,138,0.55)";
      g.lineWidth = 1.5;
      for (let row = 0; row < 2; row += 1) {
        g.beginPath();
        for (let sx = 0; sx <= tileSize; sx += 4) {
          const gx = px + sx;
          const ph = (gx * 0.18) + row * 2.2 + y * 0.6;
          const yy = py + 8 + row * 14 + Math.sin(ph) * 2.4;
          if (sx === 0) g.moveTo(gx, yy);
          else g.lineTo(gx, yy);
        }
        g.stroke();
      }
      // 貝殻・小石・ヒトデを決定的に散らす（控えめ）。
      const deco = pseudo(x, y, 31) % 11;
      if (deco === 0) {
        // ヒトデ
        g.fillStyle = "#ec8f6a";
        const cx = px + 10 + (pseudo(x, y, 32) % 10);
        const cy = py + 12 + (pseudo(x, y, 33) % 10);
        for (let a = 0; a < 5; a += 1) {
          const ang = (a / 5) * Math.PI * 2;
          g.fillRect(cx + Math.cos(ang) * 4 - 1, cy + Math.sin(ang) * 4 - 1, 3, 3);
        }
        g.fillStyle = "#f4a988";
        g.fillRect(cx - 1, cy - 1, 3, 3);
      } else if (deco === 1) {
        // 巻貝
        g.fillStyle = "#e9d3b0";
        const cx = px + 8 + (pseudo(x, y, 34) % 14);
        const cy = py + 14 + (pseudo(x, y, 35) % 10);
        g.fillRect(cx, cy, 6, 5);
        g.fillStyle = "#cdb088";
        g.fillRect(cx + 1, cy + 1, 4, 1);
        g.fillRect(cx + 4, cy, 2, 5);
      } else if (deco === 2) {
        // 小石
        g.fillStyle = "rgba(150,135,105,0.7)";
        g.fillRect(px + 6 + (pseudo(x, y, 36) % 18), py + 18 + (pseudo(x, y, 37) % 8), 4, 3);
      }
      break;
    }
    case T.REEF:
    case T.CORAL: {
      const dense = t === T.CORAL;
      // 透ける水越しの海底（青緑の抜け）。
      g.fillStyle = dense ? "#2f9a96" : "#46aaa6";
      g.fillRect(px, py, tileSize, tileSize);
      g.fillStyle = "rgba(150,225,220,0.35)";
      g.fillRect(px, py + 2, tileSize, 6);
      g.fillStyle = "rgba(20,90,90,0.3)";
      g.fillRect(px, py + tileSize - 6, tileSize, 6);
      // 脳サンゴ（丸い塊）をタイル中心に。塊で置く（点々にしない）。
      const palette = dense
        ? ["#ef6f5c", "#ff9d52", "#b06fd0"]
        : ["#f0876f", "#7fd0c4", "#e7b86a"];
      const kind = pseudo(x, y, 40) % 3;
      const cx = px + 8 + (pseudo(x, y, 41) % 8);
      const cy = py + 8 + (pseudo(x, y, 42) % 8);
      const col = palette[pseudo(x, y, 43) % palette.length];
      if (kind === 0) {
        // 脳サンゴ: 同心の塊
        g.fillStyle = col;
        g.fillRect(cx, cy, 16, 14);
        g.fillStyle = "rgba(255,255,255,0.28)";
        g.fillRect(cx + 2, cy + 2, 12, 3);
        g.fillStyle = "rgba(0,0,0,0.18)";
        g.fillRect(cx, cy + 11, 16, 3);
        // しわ
        g.fillStyle = "rgba(120,40,40,0.35)";
        g.fillRect(cx + 3, cy + 5, 10, 1);
        g.fillRect(cx + 4, cy + 8, 9, 1);
      } else if (kind === 1) {
        // 枝サンゴ
        g.fillStyle = col;
        g.fillRect(cx + 6, cy + 4, 4, 14);
        g.fillRect(cx + 1, cy + 8, 4, 10);
        g.fillRect(cx + 11, cy + 7, 4, 11);
        g.fillStyle = "rgba(255,255,255,0.3)";
        g.fillRect(cx + 6, cy + 4, 2, 14);
      } else {
        // イソギンチャク的な放射
        g.fillStyle = "#7fd0c4";
        g.fillRect(cx + 5, cy + 6, 6, 8);
        g.fillStyle = col;
        for (let a = 0; a < 6; a += 1) {
          const ang = (a / 6) * Math.PI * 2;
          g.fillRect(cx + 8 + Math.cos(ang) * 6 - 1, cy + 9 + Math.sin(ang) * 6 - 1, 2, 4);
        }
      }
      if (dense) {
        // CORALは小サンゴを追加で密に。
        g.fillStyle = palette[pseudo(x, y, 44) % palette.length];
        g.fillRect(px + 22, py + 20, 6, 6);
      }
      break;
    }
    case T.ROCK: {
      // 左上からの光で立体に見える岩塊。隣接ROCKと繋がるよう塊で。
      g.fillStyle = "#5b5d63"; // 影側ベース
      g.fillRect(px, py, tileSize, tileSize);
      g.fillStyle = "#787a82"; // 中間
      g.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 6);
      g.fillStyle = "#8f9199"; // 明面（左上）
      g.fillRect(px + 2, py + 2, tileSize - 12, tileSize - 14);
      g.fillStyle = "#a6a8b0"; // ハイライト
      g.fillRect(px + 3, py + 3, 9, 6);
      g.fillStyle = "#46484e"; // 右下の濃い陰
      g.fillRect(px + tileSize - 9, py + tileSize - 11, 9, 11);
      g.fillRect(px, py + tileSize - 4, tileSize, 4);
      // 割れ目（決定的）
      g.fillStyle = "rgba(30,30,36,0.5)";
      const cr = pseudo(x, y, 51) % 3;
      if (cr === 0) g.fillRect(px + 14, py + 6, 2, 16);
      else if (cr === 1) g.fillRect(px + 8, py + 18, 16, 2);
      else g.fillRect(px + 18, py + 4, 2, 12);
      // 水際の岩は濡れ色（下隣が水なら）。
      if (isWaterTile(tileAt(mapId, x, y + 1))) {
        g.fillStyle = "rgba(40,80,80,0.4)";
        g.fillRect(px, py + tileSize - 7, tileSize, 7);
        g.fillStyle = "rgba(70,130,90,0.35)"; // 苔
        g.fillRect(px + (pseudo(x, y, 52) % 18), py + tileSize - 9, 7, 4);
      }
      break;
    }
    case T.PIER: {
      // 板の方向・杭。港らしく。
      g.fillStyle = "#8a6a47";
      g.fillRect(px, py, tileSize, tileSize);
      // 縦板（4枚）
      for (let b = 0; b < 4; b += 1) {
        g.fillStyle = b % 2 === 0 ? "#9a7a54" : "#8a6a47";
        g.fillRect(px + b * 8, py, 8, tileSize);
        g.fillStyle = "rgba(70,52,34,0.6)"; // 目地
        g.fillRect(px + b * 8, py, 1, tileSize);
        // 木目
        g.fillStyle = "rgba(110,84,54,0.5)";
        g.fillRect(px + b * 8 + 3, py + 4 + (pseudo(x + b, y, 6) % 8), 2, 14);
      }
      // 杭（ノード位置に決定的に）
      if (pseudo(x, y, 7) % 4 === 0) {
        g.fillStyle = "#5f472f";
        g.fillRect(px + 12, py + 12, 8, 8);
        g.fillStyle = "#76583a";
        g.fillRect(px + 13, py + 13, 6, 3);
      }
      break;
    }
    case T.LAND:
    default: {
      // 南国の緑。草の質感。
      g.fillStyle = "#4f9b53";
      g.fillRect(px, py, tileSize, tileSize);
      g.fillStyle = "#458d4a";
      g.fillRect(px, py + 16, tileSize, 16);
      // 草の質感（短い縦ストローク、決定的）。
      for (let i = 0; i < 6; i += 1) {
        const r = pseudo(x, y, 60 + i);
        g.fillStyle = (r & 1) ? "#5fb061" : "#3c7e44";
        g.fillRect(px + (r % 30), py + ((r >> 5) % 28), 2, 4);
      }
      // 装飾: ヤシの木 or 茂み（決定的）。
      const land = pseudo(x, y, 70) % 9;
      if (land === 0) {
        // ヤシの木
        g.fillStyle = "#7a5a36"; // 幹
        g.fillRect(px + 14, py + 12, 4, 16);
        g.fillStyle = "#6a4d2e";
        g.fillRect(px + 14, py + 12, 2, 16);
        g.fillStyle = "#2f8f4a"; // 葉
        g.fillRect(px + 6, py + 6, 20, 4);
        g.fillRect(px + 8, py + 3, 16, 3);
        g.fillRect(px + 10, py + 9, 12, 3);
        g.fillStyle = "#3fa85a";
        g.fillRect(px + 13, py + 4, 6, 6);
      } else if (land === 1 || land === 2) {
        // 熱帯の茂み
        g.fillStyle = "#2f6e3a";
        g.fillRect(px + 6, py + 8, 18, 16);
        g.fillStyle = "#3f8a4a";
        g.fillRect(px + 8, py + 9, 14, 8);
        g.fillStyle = "#52a55e";
        g.fillRect(px + 10, py + 10, 8, 4);
        // 花
        if (land === 2) {
          g.fillStyle = "#ef6f8c";
          g.fillRect(px + 12, py + 13, 3, 3);
        }
      }
      break;
    }
  }
}

// autotile風の境界縁取り（多段階調＋コーナー）。キャッシュへ描画。
function drawTerrainEdges(g, px, py, x, y, mapId, t) {
  const rank = edgeRank(t);
  if (rank === 0) return; // 海どうしは境界処理しない
  // 各地形ごとの2-3段の階調色（外側→内側）。
  let bands;
  if (t === T.SAND) bands = ["rgba(120,200,205,0.55)", "rgba(225,210,160,0.7)"]; // 濡れ砂→乾き砂
  else if (t === T.LAND) bands = ["rgba(225,210,150,0.6)", "rgba(45,95,50,0.75)"]; // 砂寄り→草の暗縁
  else if (t === T.ROCK) bands = ["rgba(20,45,55,0.6)", "rgba(40,42,48,0.85)"]; // 暗い水際線
  else if (t === T.PIER) bands = ["rgba(40,70,80,0.5)", "rgba(70,52,34,0.85)"];
  else bands = ["rgba(150,225,220,0.5)", "rgba(110,190,185,0.6)"]; // サンゴ
  const dirs = [
    [0, -1, "up"],
    [0, 1, "down"],
    [-1, 0, "left"],
    [1, 0, "right"],
  ];
  for (const [dx, dy, dir] of dirs) {
    if (edgeRank(tileAt(mapId, x + dx, y + dy)) >= rank) continue;
    for (let b = 0; b < bands.length; b += 1) {
      g.fillStyle = bands[b];
      const off = b * 2;
      const w = 2;
      if (dir === "up") g.fillRect(px, py + off, tileSize, w);
      else if (dir === "down") g.fillRect(px, py + tileSize - off - w, tileSize, w);
      else if (dir === "left") g.fillRect(px + off, py, w, tileSize);
      else g.fillRect(px + tileSize - off - w, py, w, tileSize);
    }
  }
  // コーナー処理（斜め隣接が低ランクなら角に小ブロック）。
  const corners = [
    [-1, -1, 0, 0],
    [1, -1, tileSize - 4, 0],
    [-1, 1, 0, tileSize - 4],
    [1, 1, tileSize - 4, tileSize - 4],
  ];
  for (const [dx, dy, ox, oy] of corners) {
    if (edgeRank(tileAt(mapId, x + dx, y + dy)) >= rank) continue;
    if (edgeRank(tileAt(mapId, x + dx, y)) >= rank && edgeRank(tileAt(mapId, x, y + dy)) >= rank) continue;
    g.fillStyle = bands[bands.length - 1];
    g.fillRect(px + ox, py + oy, 4, 4);
  }
}

// 静的なマップ固有装飾（キャッシュへ描画）。
// 小さな浮き(ブイ)を描く（中心px,py 半径r）。
function decoBuoy(g, cx, cy, r, color) {
  g.fillStyle = color;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
  g.fillStyle = "rgba(255,255,255,0.6)";
  g.fillRect(cx - r, cy - r, r * 2, 2);
  g.fillStyle = "rgba(0,0,0,0.25)";
  g.fillRect(cx - r, cy + r - 2, r * 2, 2);
}
// 係留された小舟（横向き）。
function decoBoat(g, px, py, hull) {
  g.fillStyle = hull;
  g.fillRect(px + 2, py + 8, 24, 7); // 船体
  g.fillStyle = "rgba(0,0,0,0.3)";
  g.fillRect(px + 2, py + 13, 24, 2); // 喫水陰
  g.fillStyle = "rgba(255,255,255,0.5)";
  g.fillRect(px + 4, py + 8, 20, 2); // 縁のハイライト
  g.fillStyle = "#5d3618";
  g.fillRect(px + 6, py + 4, 2, 5); // 短い船首杭
  g.fillRect(px + 19, py + 4, 2, 5);
}

function drawStaticDecor(g, mapId) {
  if (mapId === "port") {
    // 灯台（東向き桟橋の先, タイル13-15 x5-7付近）。
    const lx = 7 * tileSize + 6;
    const ly = 13 * tileSize + 2;
    g.fillStyle = "#f5f0d0";
    g.fillRect(lx, ly, 16, 30);
    g.fillStyle = "#c8564c";
    g.fillRect(lx, ly + 6, 16, 6);
    g.fillRect(lx, ly + 18, 16, 6);
    g.fillStyle = "#ffe9a8";
    g.fillRect(lx + 4, ly - 6, 8, 8); // ランプ
    g.fillStyle = "#7a5b3c";
    g.fillRect(lx - 2, ly + 30, 20, 4); // 土台
    // 係留された小舟（船だまり・桟橋脇）。
    decoBoat(g, 3 * tileSize, 21 * tileSize, "#7a4a25");
    decoBoat(g, 5 * tileSize, 22 * tileSize, "#9a6a3a");
    decoBoat(g, 6 * tileSize, 9 * tileSize, "#6a5b8a");
    decoBoat(g, 16 * tileSize, 16 * tileSize, "#3f7a6a");
    // 桟橋の杭（西の桟橋の縁に並ぶ）。
    g.fillStyle = "#5f472f";
    for (let r = 1; r <= 4; r += 1) g.fillRect(7 * tileSize - 4, r * tileSize + 12, 4, 6);
    // 係留ブイ（航路の縁に決定的に数個）。
    decoBuoy(g, 9 * tileSize + 4, 8 * tileSize + 6, 5, "#e8643f");
    decoBuoy(g, 12 * tileSize + 20, 7 * tileSize + 16, 4, "#f2b134");
    decoBuoy(g, 15 * tileSize + 8, 20 * tileSize + 8, 5, "#e8643f");
    decoBuoy(g, 13 * tileSize + 16, 24 * tileSize + 6, 4, "#f2b134");
    // 漁具（浮き玉のロープ）を岸壁脇に。
    g.fillStyle = "#3a7a55";
    for (let i = 0; i < 4; i += 1) g.fillRect(2 * tileSize + 4 + i * 7, 8 * tileSize + 2, 4, 4);
  } else if (mapId === "beach") {
    // パラソルと小屋（上辺の白砂）。
    const px = 4 * tileSize, py = 1 * tileSize;
    g.fillStyle = "#7a5b3c";
    g.fillRect(px + 7, py + 4, 2, 14); // 支柱
    g.fillStyle = "#ef6f56";
    g.fillRect(px - 2, py + 2, 20, 5); // 傘
    g.fillStyle = "#f9d2c7";
    g.fillRect(px + 2, py + 2, 4, 5);
    g.fillRect(px + 10, py + 2, 4, 5);
    // 浜小屋（右上の砂浜）。
    const hx = 14 * tileSize, hy = 1 * tileSize - 2;
    g.fillStyle = "#caa46a";
    g.fillRect(hx, hy + 8, 22, 12); // 壁
    g.fillStyle = "#8a6a3a";
    g.fillRect(hx - 2, hy + 2, 26, 8); // 茅葺き屋根
    g.fillStyle = "#5d3618";
    g.fillRect(hx + 8, hy + 13, 6, 7); // 入口
    // 流木（下辺の砂州）。
    g.fillStyle = "#9a8866";
    g.fillRect(2 * tileSize + 4, 28 * tileSize + 14, 26, 5);
    g.fillRect(15 * tileSize, 27 * tileSize + 18, 22, 4);
    g.fillStyle = "#7a6a4a";
    g.fillRect(2 * tileSize + 18, 28 * tileSize + 10, 3, 6); // 枝
    // ヒトデと貝（砂州の上に決定的に）。
    const stars = [[1, 1], [18, 2], [16, 25], [2, 28], [17, 28]];
    g.fillStyle = "#ec8f6a";
    for (const [tx, ty] of stars) {
      const cx = tx * tileSize + 16, cy = ty * tileSize + 16;
      for (let a = 0; a < 5; a += 1) {
        const ang = (a / 5) * Math.PI * 2;
        g.fillRect(cx + Math.cos(ang) * 5 - 1, cy + Math.sin(ang) * 5 - 1, 3, 3);
      }
      g.fillStyle = "#f4a988";
      g.fillRect(cx - 1, cy - 1, 3, 3);
      g.fillStyle = "#ec8f6a";
    }
  } else if (mapId === "reef") {
    // 海面ブイ（航路上に点々と。礁の位置を示す目印）。
    decoBuoy(g, 5 * tileSize + 8, 4 * tileSize + 8, 5, "#f2b134");
    decoBuoy(g, 14 * tileSize + 12, 15 * tileSize + 10, 5, "#e8643f");
    decoBuoy(g, 7 * tileSize + 6, 21 * tileSize + 8, 4, "#f2b134");
    decoBuoy(g, 16 * tileSize + 8, 24 * tileSize + 10, 5, "#e8643f");
    // 観測ポール（礁上に立てた竿＋旗）。
    const poles = [[2, 1], [17, 9], [3, 26]];
    for (const [tx, ty] of poles) {
      const px = tx * tileSize + 14, py = ty * tileSize - 2;
      g.fillStyle = "#d8d2c0";
      g.fillRect(px, py, 2, 22); // 竿
      g.fillStyle = "#ef6f56";
      g.fillRect(px + 2, py + 2, 8, 5); // 旗
    }
  } else if (mapId === "offshore") {
    // 沈船（右下の深場, タイル12-16 x24-27付近）。船体＋折れたマスト。
    const sx = 12 * tileSize, sy = 24 * tileSize;
    g.fillStyle = "#3a4750";
    g.fillRect(sx, sy + 18, 7 * tileSize, 22); // 船体（傾く）
    g.fillStyle = "#2a343b";
    g.fillRect(sx, sy + 34, 7 * tileSize, 6); // 影
    g.fillStyle = "#566570";
    g.fillRect(sx + 6, sy + 14, 6 * tileSize, 6); // 甲板の縁
    g.fillStyle = "#4a3320";
    g.fillRect(sx + 30, sy - 18, 4, 38); // 折れたマスト
    g.fillRect(sx + 30, sy - 10, 26, 3); // 桁
    g.fillStyle = "#2a343b";
    g.fillRect(sx + 80, sy + 6, 14, 12); // 崩れた船首
    // 警告ブイ（深場の縁に決定的に）。
    decoBuoy(g, 12 * tileSize + 8, 6 * tileSize + 8, 5, "#f2b134");
    decoBuoy(g, 17 * tileSize + 6, 14 * tileSize + 8, 5, "#e8643f");
    decoBuoy(g, 13 * tileSize + 20, 20 * tileSize + 6, 4, "#f2b134");
    // 海上の岩柱の頭（左の外洋, ピナクルの先端を白波で）。
    g.fillStyle = "rgba(255,255,255,0.55)";
    g.fillRect(3 * tileSize + 6, 11 * tileSize + 12, 12, 4);
    g.fillRect(7 * tileSize + 8, 3 * tileSize + 14, 12, 4);
    g.fillRect(2 * tileSize + 8, 20 * tileSize + 12, 12, 4);
    g.fillRect(2 * tileSize + 6, 15 * tileSize + 12, 12, 4);
    g.fillRect(4 * tileSize + 8, 25 * tileSize + 12, 12, 4);
  } else if (mapId === "mangrove") {
    // マングローブの木（林の縁・点在する根の上に決定的に）。
    const trees = [[1, 3], [2, 9], [16, 4], [18, 19], [3, 24], [16, 27], [4, 14], [15, 11]];
    for (const [tx, ty] of trees) {
      const bx = tx * tileSize + 8, by = ty * tileSize + 6;
      g.fillStyle = "#5d3f22";
      g.fillRect(bx + 6, by + 12, 4, 14); // 幹
      g.fillStyle = "#2f6b39";
      g.fillRect(bx - 2, by, 20, 14); // 葉冠
      g.fillStyle = "#3f8049";
      g.fillRect(bx + 2, by + 2, 12, 8);
      g.fillStyle = "#6b4a2a"; // 支柱根
      for (let i = 0; i < 3; i += 1) g.fillRect(bx + 2 + i * 5, by + 24, 2, 6);
    }
    // 干潟の生き物（カニ・ムツゴロウを小さな点で）。
    const crabs = [[5, 6], [13, 16], [6, 22], [14, 8], [4, 26]];
    g.fillStyle = "#b5723f";
    for (const [tx, ty] of crabs) {
      const cx = tx * tileSize + 14, cy = ty * tileSize + 18;
      g.fillRect(cx, cy, 6, 4); // 甲羅
      g.fillRect(cx - 3, cy + 1, 3, 2); // 脚
      g.fillRect(cx + 6, cy + 1, 3, 2);
    }
  } else if (mapId === "reef") {
    // （既存のブイ・観測ポールに加え）礁原の観測ブイをもう数個。
    decoBuoy(g, 2 * tileSize + 10, 13 * tileSize + 8, 4, "#f2b134");
    decoBuoy(g, 17 * tileSize + 8, 6 * tileSize + 10, 5, "#e8643f");
  } else if (mapId === "bluehole") {
    // 水面の観測ブイ（入口側）と落ち口を示す警告ブイ。
    decoBuoy(g, 3 * tileSize + 10, 8 * tileSize + 8, 5, "#f2b134");
    decoBuoy(g, 5 * tileSize + 8, 16 * tileSize + 10, 4, "#e8643f");
    decoBuoy(g, 2 * tileSize + 12, 22 * tileSize + 8, 5, "#f2b134");
    // 観測ポール（縁の根に立てた竿＋旗）。
    const poles = [[10, 1], [10, 26]];
    for (const [tx, ty] of poles) {
      const px = tx * tileSize + 14, py = ty * tileSize - 2;
      g.fillStyle = "#d8d2c0";
      g.fillRect(px, py, 2, 22);
      g.fillStyle = "#5fa9c8";
      g.fillRect(px + 2, py + 2, 8, 5);
    }
  } else if (mapId === "ogami") {
    // 鳥居の遠景（参道側, 赤い結界の門）。
    const tox = 15 * tileSize, toy = 5 * tileSize;
    g.fillStyle = "#b5341f";
    g.fillRect(tox, toy, 2, 22); // 柱
    g.fillRect(tox + 14, toy, 2, 22);
    g.fillRect(tox - 4, toy - 4, 24, 4); // 笠木
    g.fillRect(tox - 1, toy + 3, 18, 3); // 貫
    // 御嶽の祠（左の杜の小島の上）。
    const sx = 2 * tileSize + 4, sy = 14 * tileSize + 2;
    g.fillStyle = "#cabfa0";
    g.fillRect(sx, sy + 8, 16, 10); // 社
    g.fillStyle = "#6a5436";
    g.fillRect(sx - 2, sy + 2, 20, 8); // 屋根
    g.fillStyle = "#3a2c18";
    g.fillRect(sx + 6, sy + 12, 4, 6); // 入口
    // 聖域の標（積み石ケルン）を深海の縁に。
    const cairns = [[5, 9], [4, 22], [6, 18]];
    for (const [tx, ty] of cairns) {
      const cx = tx * tileSize + 12, cy = ty * tileSize + 8;
      g.fillStyle = "#6f7a82";
      g.fillRect(cx, cy + 10, 10, 4);
      g.fillRect(cx + 1, cy + 5, 8, 4);
      g.fillRect(cx + 2, cy, 6, 4);
    }
  }
}

// ------------------------------------------------------------------
// 動的アニメ層（毎フレーム live ctx に描画）。水のきらめき/帯リップル/泡。
// ------------------------------------------------------------------
function drawWaterDynamics(mapId) {
  const f = state.frame;
  for (let y = 0; y < mapRows; y += 1) {
    for (let x = 0; x < mapCols; x += 1) {
      const t = tileAt(mapId, x, y);
      if (!isWaterTile(t)) continue;
      const px = x * tileSize;
      const py = y * tileSize;
      if (t === T.FOAM) {
        // 波打ち際: 白泡をframeで寄せ引き。
        const swell = Math.floor((Math.sin(f / 14 + x * 0.6) + 1) * 6); // 0..12
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(px, py + tileSize - 4 - swell, tileSize, 4);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        for (let i = 0; i < 4; i += 1) {
          const r = pseudo(x, y, 20 + i);
          ctx.fillRect(px + (r % 28), py + tileSize - 10 - swell + ((r >> 5) % 6), 3, 2);
        }
        continue;
      }
      // 帯リップル: 横長の明色ラインを (x,y) 連続位相でゆっくり横スクロール。
      const alpha = t === T.SHALLOW ? 0.22 : t === T.SEA ? 0.14 : 0.09;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      // タイル境界で途切れないよう絶対座標(px+x*..)基準で位相を取る。
      const phase = (f * 0.4 + (px + py) * 0.05);
      const ox = ((phase % 32) + 32) % 32;
      ctx.fillRect(px + ox - 20, py + 8, 20, 2);
      ctx.fillRect(px + ((ox + 16) % 32) - 16, py + 22, 16, 2);
      // 規則格子上のきらめき点（2フレーム周期程度で明滅）。
      if ((x + y) % 2 === ((f >> 4) & 1)) {
        const tw = (Math.sin(f / 6 + x * 1.3 + y * 0.7) + 1) / 2;
        if (tw > 0.7) {
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          const gx = 8 + (pseudo(x, y, 80) % 16);
          const gy = 8 + (pseudo(x, y, 81) % 16);
          ctx.fillRect(px + gx, py + gy, 2, 2);
        }
      }
    }
  }
}

// ゲート障害物（type別の高精細描画）。
function drawObstacleSprite(px, py, type, frame) {
  ctx.save();
  if (type === "drift") {
    // 流木: 横長の倒木＋枝＋年輪/木目。
    ctx.fillStyle = "#5f4327";
    ctx.fillRect(px + 1, py + 11, 30, 12); // 幹
    ctx.fillStyle = "#6f4f30";
    ctx.fillRect(px + 1, py + 11, 30, 4); // 上面ハイライト帯
    ctx.fillStyle = "#4a3320";
    ctx.fillRect(px + 1, py + 21, 30, 2); // 下面陰
    // 木目ライン
    ctx.fillStyle = "rgba(40,28,16,0.7)";
    ctx.fillRect(px + 4, py + 14, 24, 1);
    ctx.fillRect(px + 6, py + 18, 22, 1);
    // 年輪（端の切り口）
    ctx.fillStyle = "#7a5836";
    ctx.fillRect(px + 1, py + 11, 5, 12);
    ctx.fillStyle = "#a07a4c";
    ctx.fillRect(px + 2, py + 14, 3, 6);
    ctx.fillStyle = "#5f4327";
    ctx.fillRect(px + 3, py + 16, 1, 2);
    // 枝
    ctx.fillStyle = "#5f4327";
    ctx.fillRect(px + 18, py + 5, 3, 7);
    ctx.fillRect(px + 18, py + 5, 8, 2);
  } else if (type === "surge") {
    // うず潮: 渦巻く水流。frameで回転する同心の弧＋泡。
    const cx = px + 16;
    const cy = py + 16;
    ctx.fillStyle = "rgba(20,70,100,0.55)";
    ctx.fillRect(px + 2, py + 2, 28, 28);
    const rot = frame / 9;
    const rings = [
      { r: 12, c: "rgba(180,235,245,0.85)" },
      { r: 8, c: "rgba(120,200,225,0.85)" },
      { r: 4, c: "rgba(230,250,255,0.95)" },
    ];
    for (let k = 0; k < rings.length; k += 1) {
      const { r, c } = rings[k];
      ctx.strokeStyle = c;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, rot + k * 1.2, rot + k * 1.2 + Math.PI * 1.3);
      ctx.stroke();
    }
    // 中心と回転する泡。
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(cx - 2, cy - 2, 4, 4);
    for (let i = 0; i < 3; i += 1) {
      const a = rot * 1.4 + i * 2.1;
      ctx.fillRect(cx + Math.cos(a) * 13 - 1, cy + Math.sin(a) * 13 - 1, 3, 3);
    }
  } else if (type === "reeds") {
    // マングローブの茂み: 密集した緑の葦/根が道を塞ぐ。frameで葉先が揺れる。
    // 泥の根元
    ctx.fillStyle = "#3a2c1c";
    ctx.fillRect(px, py + tileSize - 6, tileSize, 6);
    // 根（赤茶の支柱根）
    ctx.fillStyle = "#6b4a2c";
    ctx.fillRect(px + 4, py + 18, 3, 10);
    ctx.fillRect(px + 14, py + 16, 3, 12);
    ctx.fillRect(px + 24, py + 18, 3, 10);
    // 葦/葉の束（濃淡の緑を縦に重ねる）
    const greens = ["#2f6b3a", "#3c8347", "#4f9b56", "#5fae62"];
    const sway = Math.sin(frame / 10) * 2;
    for (let i = 0; i < 7; i += 1) {
      const bx = px + 2 + i * 4;
      const h = 16 + ((i * 5) % 9);
      const top = py + tileSize - 6 - h;
      const off = (i % 2 === 0 ? sway : -sway);
      ctx.fillStyle = greens[i % greens.length];
      ctx.fillRect(bx, top, 3, h);
      // 揺れる葉先
      ctx.fillRect(bx + off, top - 2, 3, 4);
    }
    // 上部の葉のかたまり
    ctx.fillStyle = "#3c8347";
    ctx.fillRect(px + 5, py + 4, 8, 5);
    ctx.fillRect(px + 17, py + 6, 9, 5);
    ctx.fillStyle = "#5fae62";
    ctx.fillRect(px + 7, py + 3, 4, 3);
    ctx.fillRect(px + 19, py + 5, 4, 3);
  } else if (type === "abyss") {
    // ブルーホールの淵: 暗く深い縦穴。同心の濃淵＋frameで吸い込まれる渦/泡。
    const cx = px + 16;
    const cy = py + 16;
    // 縁の岩棚
    ctx.fillStyle = "#13405e";
    ctx.fillRect(px + 1, py + 1, 30, 30);
    // 同心の淵（外→内で暗くなる）
    const depths = [
      { r: 14, c: "#0e3350" },
      { r: 11, c: "#0a2742" },
      { r: 8, c: "#061b30" },
      { r: 5, c: "#03101f" },
      { r: 3, c: "#01070f" },
    ];
    for (const d of depths) {
      ctx.fillStyle = d.c;
      ctx.beginPath();
      ctx.arc(cx, cy, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // 吸い込まれる渦（frameで回転）
    const rot = -frame / 7;
    ctx.strokeStyle = "rgba(90,160,200,0.55)";
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 2; k += 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + k * 4, rot + k * 2.0, rot + k * 2.0 + Math.PI * 1.4);
      ctx.stroke();
    }
    // 吸い込まれる泡
    ctx.fillStyle = "rgba(200,235,250,0.8)";
    for (let i = 0; i < 4; i += 1) {
      const a = rot * 1.3 + i * 1.6;
      const rr = 10 - (i % 3) * 2;
      ctx.fillRect(cx + Math.cos(a) * rr - 1, cy + Math.sin(a) * rr - 1, 2, 2);
    }
  } else if (type === "sacred") {
    // 拝所の鳥居: 朱の鳥居＋しめ縄＋揺れる紙垂(frame)。聖域への結界。
    const baseY = py + tileSize - 3;
    // 石段の土台
    ctx.fillStyle = "#8a8d93";
    ctx.fillRect(px + 3, baseY, tileSize - 6, 3);
    // 鳥居の二本柱(朱)
    ctx.fillStyle = "#c1352b";
    ctx.fillRect(px + 6, py + 6, 4, tileSize - 9);
    ctx.fillRect(px + 22, py + 6, 4, tileSize - 9);
    // 柱の陰
    ctx.fillStyle = "#9a221a";
    ctx.fillRect(px + 9, py + 6, 1, tileSize - 9);
    ctx.fillRect(px + 25, py + 6, 1, tileSize - 9);
    // 笠木(上の横木、両端が反り上がる)
    ctx.fillStyle = "#c1352b";
    ctx.fillRect(px + 2, py + 5, tileSize - 4, 4);
    ctx.fillStyle = "#9a221a";
    ctx.fillRect(px + 2, py + 8, tileSize - 4, 1);
    // 反り上がりの端
    ctx.fillStyle = "#c1352b";
    ctx.fillRect(px + 1, py + 4, 3, 2);
    ctx.fillRect(px + tileSize - 4, py + 4, 3, 2);
    // 貫(下の横木)
    ctx.fillStyle = "#b73027";
    ctx.fillRect(px + 4, py + 12, tileSize - 8, 3);
    // しめ縄(白)＋揺れる紙垂(しで)
    ctx.fillStyle = "#f2ead6";
    ctx.fillRect(px + 5, py + 10, tileSize - 10, 2);
    const sway = Math.round(Math.sin(frame / 11) * 1.5);
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 3; i += 1) {
      const sx = px + 9 + i * 6 + (i % 2 === 0 ? sway : -sway);
      ctx.fillRect(sx, py + 12, 2, 5);
    }
  } else {
    // cave: 暗がり。岩の縁取り＋暗い半透明オーバーレイ。
    ctx.fillStyle = "#5b5d63";
    ctx.fillRect(px, py, tileSize, tileSize);
    ctx.fillStyle = "#7d7f86";
    ctx.fillRect(px + 2, py + 2, 28, 6); // 岩の上縁
    ctx.fillStyle = "#46484e";
    ctx.fillRect(px, py + tileSize - 6, tileSize, 6);
    // 洞口（奥が見えない暗がり）
    ctx.fillStyle = "#161a1f";
    ctx.beginPath();
    ctx.moveTo(px + 6, py + tileSize - 4);
    ctx.lineTo(px + 10, py + 9);
    ctx.lineTo(px + 22, py + 9);
    ctx.lineTo(px + 26, py + tileSize - 4);
    ctx.closePath();
    ctx.fill();
    // 縁のハイライト岩。
    ctx.fillStyle = "#9a9ca3";
    ctx.fillRect(px + 4, py + 4, 5, 3);
    ctx.fillRect(px + 24, py + 5, 4, 3);
    // ゆらぐ暗がり（frameでわずかに濃淡）。
    const a = 0.25 + (Math.sin(frame / 18) + 1) * 0.12;
    ctx.fillStyle = `rgba(0,0,0,${a.toFixed(3)})`;
    ctx.fillRect(px + 9, py + 11, 14, tileSize - 15);
  }
  ctx.restore();
}

function drawGates(mapId) {
  for (const g of GATES[mapId] || []) {
    if (state.cleared[g.id]) continue; // 解除済みは描かない（消失アニメは別途）
    // cells全マスにテーマ障害物の帯を描く。各マスでframe位相をずらし、連続した自然な帯に見せる。
    for (let i = 0; i < g.cells.length; i += 1) {
      const [cx, cy] = g.cells[i];
      // セルごとの擬似位相（座標から決定的に算出。隣接マスと少しずつ変化させ帯のうねりを出す）。
      const phase = ((cx * 7 + cy * 13) % 24);
      drawObstacleSprite(cx * tileSize, cy * tileSize, g.type, state.frame + phase);
    }
  }
  // 解除した瞬間の消失アニメ（このマップのもの・進行中のみ。cells全マスで再生）。
  const fx = state.gateFx;
  if (fx) {
    const elapsed = state.frame - fx.start;
    if (elapsed >= fx.dur) {
      state.gateFx = null; // 終了したら何も描かない（下の開けた水面が残る）
    } else if (fx.cells) {
      for (let i = 0; i < fx.cells.length; i += 1) {
        const [cx, cy] = fx.cells[i];
        const phase = ((cx * 7 + cy * 13) % 24);
        drawGateClearFx(cx * tileSize, cy * tileSize, fx.type, elapsed + (phase % 6), fx.dur);
      }
    }
  }
}

// ゲート解除の消失エフェクト。type毎に演出を変え、t/dur(0→1)で消えていく。
// 一時的・小範囲（fillRect/arc中心）。
function drawGateClearFx(px, py, type, t, dur) {
  const p = t / dur; // 0..1 進行
  const fade = 1 - p; // 1→0
  const cx = px + 16;
  const cy = py + 16;
  ctx.save();
  if (type === "drift") {
    // 流木: 砕けて破片が流れ去る。
    const pieces = [
      [-10, 0, 12, 6], [4, -2, 10, 5], [-4, 6, 9, 5], [8, 6, 7, 4],
    ];
    ctx.fillStyle = `rgba(95,67,39,${fade.toFixed(2)})`;
    for (let i = 0; i < pieces.length; i += 1) {
      const [ox, oy, w, h] = pieces[i];
      const dx = ox + (i % 2 === 0 ? 1 : -1) * p * 20; // 左右へ流れる
      const dy = oy + p * 14; // 沈む
      ctx.fillRect(cx + dx - w / 2, cy + dy - h / 2, w, h * fade + 1);
    }
    // 飛沫
    ctx.fillStyle = `rgba(230,245,255,${(fade * 0.9).toFixed(2)})`;
    for (let i = 0; i < 5; i += 1) {
      const a = i * 1.3;
      const r = 4 + p * 16;
      ctx.fillRect(cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, 2, 2);
    }
  } else if (type === "surge") {
    // うず潮: 渦がほどけて静まる（広がりながら薄れる弧）。
    const rot = t / 5;
    for (let k = 0; k < 3; k += 1) {
      ctx.strokeStyle = `rgba(180,235,245,${(fade * 0.8).toFixed(2)})`;
      ctx.lineWidth = 2.5 * fade + 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 4 + k * 4 + p * 12, rot + k, rot + k + Math.PI * (1.4 - p));
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(255,255,255,${(fade * 0.7).toFixed(2)})`;
    ctx.fillRect(cx - 2, cy - 2, 4 * fade + 1, 4 * fade + 1);
  } else if (type === "cave") {
    // 洞窟: 光が差し込んで明るくなる（白い放射＋暗がりが晴れる）。
    const glow = Math.sin(p * Math.PI); // 0→1→0 のピーク
    ctx.fillStyle = `rgba(255,247,210,${(glow * 0.85).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 6 + p * 16, 0, Math.PI * 2);
    ctx.fill();
    // 放射状の光条
    ctx.strokeStyle = `rgba(255,255,235,${(glow * 0.9).toFixed(2)})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i += 1) {
      const a = i * (Math.PI / 3) + t / 12;
      const r0 = 4, r1 = 8 + p * 16;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.stroke();
    }
  } else if (type === "reeds") {
    // 茂み: 左右にかき分けられて開く（緑の束が両脇へ退く＋葉が散る）。
    ctx.fillStyle = `rgba(60,131,71,${fade.toFixed(2)})`;
    const part = p * 14; // 開く幅
    for (let i = 0; i < 4; i += 1) {
      const h = 18 - i * 2;
      ctx.fillRect(cx - 6 - part, cy - h / 2 + i * 2, 3, h); // 左へ
      ctx.fillRect(cx + 3 + part, cy - h / 2 + i * 2, 3, h); // 右へ
    }
    // 散る葉
    ctx.fillStyle = `rgba(95,174,98,${(fade * 0.9).toFixed(2)})`;
    for (let i = 0; i < 5; i += 1) {
      const a = i * 1.25;
      const r = 4 + p * 14;
      ctx.fillRect(cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1 - p * 6, 2, 3);
    }
  } else if (type === "abyss") {
    // 淵: 渦が開いて道になる（暗い渦が広がりつつ薄れ、中心が抜ける）。
    const rot = -t / 5;
    ctx.strokeStyle = `rgba(90,160,200,${(fade * 0.7).toFixed(2)})`;
    ctx.lineWidth = 2 * fade + 0.5;
    for (let k = 0; k < 2; k += 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, 5 + k * 5 + p * 14, rot + k * 2, rot + k * 2 + Math.PI * (1.5 - p));
      ctx.stroke();
    }
    // 開いた道の明るい中心
    ctx.fillStyle = `rgba(150,210,235,${(Math.sin(p * Math.PI) * 0.5).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(cx, cy, p * 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "sacred") {
    // 鳥居: 光って霧散する（朱がフェード＋金色の光が広がって消える）。
    ctx.fillStyle = `rgba(193,53,43,${fade.toFixed(2)})`;
    ctx.fillRect(px + 6, py + 6 - p * 8, 4, (tileSize - 9) * fade); // 退く柱
    ctx.fillRect(px + 22, py + 6 - p * 8, 4, (tileSize - 9) * fade);
    ctx.fillRect(px + 2, py + 5 - p * 8, tileSize - 4, 4 * fade + 1);
    // 金色の光輪
    const glow = Math.sin(p * Math.PI);
    ctx.strokeStyle = `rgba(255,225,140,${(glow * 0.9).toFixed(2)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 4 + p * 18, 0, Math.PI * 2);
    ctx.stroke();
    // 霧散する光の粒
    ctx.fillStyle = `rgba(255,240,200,${(fade * 0.9).toFixed(2)})`;
    for (let i = 0; i < 6; i += 1) {
      const a = i * (Math.PI / 3) + t / 10;
      const r = 4 + p * 16;
      ctx.fillRect(cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1 - p * 4, 2, 2);
    }
  }
  ctx.restore();
}

function drawMapLabel() {
  ctx.save();
  ctx.font = "700 16px system-ui";
  ctx.textBaseline = "top";
  const area = getCurrentArea();
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.fillRect(10, 10, 122, 28);
  ctx.fillStyle = "#17202a";
  ctx.fillText(area.name, 16, 16);
  ctx.restore();
}

// ---- ミニマップ（宮古島シルエット＋現在地マーカー） ----
// 座標は全てパネル内側領域の正規化座標 (0..1)。x→東(右), y→南(下), 北=上。
// 宮古諸島を様式化。配置の相対関係（本島=中央 / 伊良部下地=西 / 池間=北 /
// 来間=南西 / 大神=北東 / 八重干瀬=北の礁域）を保持。
const MINIMAP = {
  // 八重干瀬: 本島〜池間の北に広がる大きなサンゴ礁（淡い色＋点線で礁域表現）。
  yabiji: { cx: 0.46, cy: 0.16, rx: 0.30, ry: 0.11 },
  // 各島のシルエット（正規化ポリゴン）。陸=淡い緑〜砂色で塗る。
  islands: [
    // 宮古島本島（中央のやや横長の島、最大）
    [
      [0.36, 0.42], [0.50, 0.38], [0.66, 0.42], [0.74, 0.52],
      [0.72, 0.66], [0.60, 0.74], [0.46, 0.74], [0.36, 0.66],
      [0.32, 0.54],
    ],
    // 池間島（本島の北の小島）
    [
      [0.44, 0.27], [0.53, 0.26], [0.56, 0.31], [0.50, 0.35], [0.43, 0.32],
    ],
    // 大神島（本島の北東の小島）
    [
      [0.70, 0.34], [0.76, 0.34], [0.77, 0.39], [0.71, 0.39],
    ],
    // 来間島（本島の南西の小島）
    [
      [0.34, 0.74], [0.42, 0.74], [0.43, 0.80], [0.35, 0.81], [0.31, 0.78],
    ],
    // 伊良部島＋下地島（本島の西、ひとまとまりの島）
    [
      [0.10, 0.42], [0.24, 0.40], [0.30, 0.50], [0.27, 0.62],
      [0.16, 0.66], [0.07, 0.58], [0.06, 0.48],
    ],
  ],
  // 橋（島々をつなぐ細い線）: [x1,y1,x2,y2]
  bridges: [
    [0.27, 0.50, 0.34, 0.52], // 伊良部大橋(本島-伊良部)
    [0.49, 0.33, 0.49, 0.40], // 池間大橋(本島-池間)
    [0.43, 0.74, 0.42, 0.76], // 来間大橋(本島-来間)
  ],
  // 4エリアの現在地マーカー（実在位置の相対配置）
  markers: {
    port: { x: 0.37, y: 0.52, name: "平良港" },        // 本島の西〜中央西沿岸
    beach: { x: 0.42, y: 0.71, name: "与那覇前浜" },     // 本島の南西沿岸
    reef: { x: 0.50, y: 0.18, name: "八重干瀬" },        // 本島/池間の北の礁域
    offshore: { x: 0.07, y: 0.50, name: "伊良部沖" },    // 伊良部島の西沖
    mangrove: { x: 0.56, y: 0.40, name: "島尻マングローブ" }, // 本島の北〜北中央(島尻地区、大神島の手前)
    bluehole: { x: 0.09, y: 0.55, name: "通り池" },      // 下地島(伊良部島の西隣)
    ogami: { x: 0.73, y: 0.37, name: "大神島" },          // 本島の北東の小島
  },
};

// 左下隅に宮古島シルエット＋現在地マーカーのミニマップを描く。
// 小さいので毎フレーム描画でも軽い（パスは MINIMAP 定数を参照するだけ）。
function drawMinimap() {
  const W = 140, H = 150, margin = 12;
  const px = margin;                 // 左基準
  const py = MAP_H - margin - H;     // 下基準（左下隅）
  const pad = 8;                     // パネル内側余白
  const ix = px + pad, iy = py + pad;
  const iw = W - pad * 2, ih = H - pad * 2;
  // 正規化座標→パネル内ピクセル
  const X = (nx) => ix + nx * iw;
  const Y = (ny) => iy + ny * ih;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // パネル背景（半透明・濃い水色＝海）
  ctx.fillStyle = "rgba(8,42,62,0.78)";
  ctx.fillRect(px, py, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(px, py, W, 2);
  ctx.strokeStyle = "rgba(255,255,255,0.30)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, W - 1, H - 1);

  // 海域の内側（少し明るい水色）
  ctx.fillStyle = "rgba(20,86,118,0.55)";
  ctx.fillRect(ix, iy, iw, ih);

  // タイトル
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "700 10px system-ui";
  ctx.textBaseline = "top";
  ctx.fillText("宮古島", ix + 2, iy + 1);

  // --- 八重干瀬（礁域）: 淡い色のにじみ＋点線リング ---
  const yb = MINIMAP.yabiji;
  ctx.fillStyle = "rgba(140,225,210,0.20)";
  ctx.beginPath();
  ctx.ellipse(X(yb.cx), Y(yb.cy), yb.rx * iw, yb.ry * ih, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.setLineDash([2, 2]);
  ctx.strokeStyle = "rgba(150,235,220,0.65)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(X(yb.cx), Y(yb.cy), yb.rx * iw, yb.ry * ih, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // --- 橋（陸より先に細線で） ---
  ctx.strokeStyle = "rgba(220,210,180,0.7)";
  ctx.lineWidth = 1;
  for (const b of MINIMAP.bridges) {
    ctx.beginPath();
    ctx.moveTo(X(b[0]), Y(b[1]));
    ctx.lineTo(X(b[2]), Y(b[3]));
    ctx.stroke();
  }

  // --- 島のシルエット（淡い緑〜砂色の陸＋縁取り） ---
  for (const poly of MINIMAP.islands) {
    ctx.beginPath();
    ctx.moveTo(X(poly[0][0]), Y(poly[0][1]));
    for (let i = 1; i < poly.length; i++) ctx.lineTo(X(poly[i][0]), Y(poly[i][1]));
    ctx.closePath();
    ctx.fillStyle = "#cfe0a0"; // 淡い緑（陸）
    ctx.fill();
    ctx.strokeStyle = "#e6d7a6"; // 砂色の海岸縁
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // --- 現在地マーカー ---
  const f = state.frame;
  for (const [id, m] of Object.entries(MINIMAP.markers)) {
    const mx = X(m.x), my = Y(m.y);
    const active = id === state.currentMap;
    if (active) {
      // 脈動するリング（state.frame）
      const pulse = (Math.sin(f / 12) + 1) / 2; // 0..1
      const ring = 4 + pulse * 5;
      ctx.strokeStyle = `rgba(255,210,90,${(0.7 - pulse * 0.5).toFixed(2)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mx, my, ring, 0, Math.PI * 2);
      ctx.stroke();
      // 大きく色付きの現在地ドット
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath();
      ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
      ctx.stroke();
      // 現在地名（小さく）
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "700 9px system-ui";
      ctx.textBaseline = "middle";
      const tw = ctx.measureText(m.name).width;
      // パネル右端をはみ出さない向きにラベルを置く
      let lx = mx + 6;
      if (lx + tw > ix + iw) lx = mx - 6 - tw;
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(lx - 1, my - 6, tw + 2, 12);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fillText(m.name, lx, my);
    } else {
      // 他エリアは小さな点
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.beginPath();
      ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// 宮古島の小舟（サバニ）に乗った麦わら帽子の島の子。
// 全部 fillRect のドット積み上げ。ピクセルパキッと描く。
const PLAYER_COLORS = {
  shadow: "rgba(10,40,55,0.22)",
  wake: "rgba(255,255,255,0.85)",
  wakeSoft: "rgba(255,255,255,0.45)",
  boatHull: "#7a4a25",
  boatHullDark: "#5d3618",
  boatRim: "#b07a42",
  boatInner: "#3f2814",
  hat: "#e7c873",
  hatDark: "#c9a64e",
  hatBand: "#b8863a",
  skin: "#f4c79c",
  skinDark: "#d9a877",
  shirt: "#ef6f56",
  shirtDark: "#c9543e",
  hair: "#3a2418",
  oar: "#a9762f",
  oarBlade: "#caa05a",
  eye: "#22303a",
};

// 1ドット=2pxで描く小さなヘルパ（ピクセルアートの密度を上げる）
function pset(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawPlayer() {
  const C = PLAYER_COLORS;
  // タイル中心基準。bob は既存のサインを活かす（舟が波で上下に揺れる）
  const bob = Math.sin(state.frame / 8) * 1.5;
  const ox = state.player.x * tileSize; // タイル左上
  const oy = state.player.y * tileSize;
  const cx = ox + tileSize / 2; // タイル中心X
  const baseY = oy + bob; // bob を全体に適用

  // 漕ぎ/揺れの2〜4フレーム位相。移動時(stepCount)で進み、停止中も微かに揺れる。
  const rowPhase = Math.floor((state.stepCount * 2 + state.frame / 10) % 4);
  const rowSwing = [0, 1, 0, -1][rowPhase]; // オールの振り
  const sway = Math.sin(state.frame / 9) * 0.6; // 体の左右ゆれ

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // --- 水面の影（足元の薄い楕円） ---
  ctx.fillStyle = C.shadow;
  ctx.beginPath();
  ctx.ellipse(cx, oy + 27, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- 航跡の波紋（移動方向の後方に引き波） ---
  drawPlayerWake(cx, oy, baseY);

  const f = state.facing;
  if (f === "down") drawBoatFront(cx, baseY, rowSwing, sway, false);
  else if (f === "up") drawBoatFront(cx, baseY, rowSwing, sway, true);
  else drawBoatSide(cx, baseY, rowSwing, sway, f === "left");

  ctx.restore();
}

// 後方の引き波（白い弧・泡）。state.frame でアニメ。
function drawPlayerWake(cx, oy, baseY) {
  const C = PLAYER_COLORS;
  const t = state.frame;
  // 進行方向の反対側に波を出す
  let wx = 0, wy = 0;
  switch (state.facing) {
    case "up": wy = 1; break;
    case "down": wy = -1; break;
    case "left": wx = 1; break;
    case "right": wx = -1; break;
  }
  const boatCY = baseY + 18; // 船体中央あたり
  for (let i = 0; i < 3; i++) {
    const phase = (t / 7 + i * 0.6) % 3; // 0..3 で外へ広がる
    const dist = 6 + phase * 6;
    const alpha = Math.max(0, 0.6 - phase * 0.2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    const spread = 4 + phase * 3;
    const px = cx + wx * dist;
    const py = boatCY + wy * dist;
    // 弧を点線状の泡で表現（横/縦で並べ方を変える）
    if (wx !== 0) {
      ctx.fillRect(px, py - spread, 2, 2);
      ctx.fillRect(px, py, 2, 2);
      ctx.fillRect(px, py + spread, 2, 2);
    } else {
      ctx.fillRect(px - spread, py, 2, 2);
      ctx.fillRect(px, py, 2, 2);
      ctx.fillRect(px + spread, py, 2, 2);
    }
  }
}

// 正面/背面（down=正面, up=背面）。舟は手前に開いた台形。
function drawBoatFront(cx, baseY, rowSwing, sway, back) {
  const C = PLAYER_COLORS;
  const left = Math.round(cx - 13 + sway);
  const y = Math.round(baseY);

  // --- 舟体（手前に幅広の台形・木目） ---
  // 外殻
  pset(left + 1, y + 18, 24, 9, C.boatHullDark);
  pset(left + 3, y + 16, 20, 4, C.boatHull);
  // 縁（リム）
  pset(left + 2, y + 16, 22, 2, C.boatRim);
  // 内側の影
  pset(left + 5, y + 18, 16, 3, C.boatInner);
  // ハイライト
  pset(left + 4, y + 25, 18, 1, C.boatRim);

  // オールの振り（両側、漕ぐ動き）
  const oarY = y + 17 + rowSwing;
  pset(left - 3, oarY, 5, 2, C.oar);
  pset(left - 4, oarY + rowSwing, 2, 3, C.oarBlade);
  pset(left + 22, oarY, 5, 2, C.oar);
  pset(left + 25, oarY + rowSwing, 2, 3, C.oarBlade);

  // --- 人物（舟の中央） ---
  const bx = left + 8;
  // 胴（シャツ）
  pset(bx, y + 11, 9, 7, C.shirt);
  pset(bx, y + 11, 9, 1, C.shirtDark);
  pset(bx + 1, y + 16, 7, 2, C.shirtDark);
  // 腕（左右）
  pset(bx - 2, y + 12, 2, 5, C.skin);
  pset(bx + 9, y + 12, 2, 5, C.skin);

  if (back) {
    // 背面：後頭部（髪）
    pset(bx + 1, y + 6, 7, 5, C.hair);
    pset(bx + 1, y + 6, 7, 1, "#2a190f");
  } else {
    // 正面：顔
    pset(bx + 1, y + 6, 7, 5, C.skin);
    pset(bx + 1, y + 10, 7, 1, C.skinDark);
    // 目
    pset(bx + 2, y + 8, 1, 2, C.eye);
    pset(bx + 6, y + 8, 1, 2, C.eye);
    // ほっぺ
    pset(bx + 1, y + 9, 1, 1, "#f0a98a");
    pset(bx + 7, y + 9, 1, 1, "#f0a98a");
  }

  // --- 麦わら帽子（上に大きめ） ---
  pset(bx - 2, y + 5, 13, 2, C.hatDark); // つば
  pset(bx - 1, y + 4, 11, 1, C.hat);
  pset(bx, y, 7, 5, C.hat); // 山
  pset(bx, y, 7, 1, C.hatDark);
  pset(bx + 1, y + 1, 5, 1, "#f3da95"); // ハイライト
  pset(bx, y + 4, 7, 1, C.hatBand); // バンド
}

// 横向き（left/right）。leftSide=true は左向き。
function drawBoatSide(cx, baseY, rowSwing, sway, leftSide) {
  const C = PLAYER_COLORS;
  const y = Math.round(baseY);
  ctx.save();
  // 右向きベースで描き、左向きは反転
  if (leftSide) {
    ctx.translate(Math.round(cx * 2), 0);
    ctx.scale(-1, 1);
  }
  const left = Math.round(cx - 13 + sway);

  // --- 舟体（横から見た細長い船） ---
  pset(left, y + 19, 26, 8, C.boatHullDark);
  pset(left + 2, y + 17, 23, 3, C.boatHull);
  pset(left + 1, y + 16, 24, 2, C.boatRim); // 縁
  // 舳先（前方が少しせり上がる）
  pset(left + 24, y + 15, 3, 2, C.boatRim);
  pset(left + 25, y + 14, 2, 2, C.boatRim);
  pset(left + 4, y + 19, 18, 2, C.boatInner); // 内側影
  pset(left + 3, y + 25, 20, 1, C.boatRim); // 下ハイライト

  // オール（後方へ、漕ぐ振り）
  const oarY = y + 16 + rowSwing;
  pset(left - 4, oarY, 8, 2, C.oar);
  pset(left - 6, oarY + 2 + rowSwing, 3, 3, C.oarBlade);

  // --- 人物（横顔） ---
  const bx = left + 9;
  // 胴（シャツ・横）
  pset(bx, y + 11, 7, 7, C.shirt);
  pset(bx, y + 11, 7, 1, C.shirtDark);
  pset(bx + 5, y + 12, 2, 5, C.shirtDark); // 背中側の影
  // 腕（前に出して漕ぐ）
  pset(bx - 2, y + 12 + rowSwing, 3, 2, C.skin);

  // 横顔
  pset(bx + 1, y + 6, 6, 5, C.skin);
  pset(bx, y + 7, 1, 3, C.skin); // 鼻先（前方）
  pset(bx + 1, y + 10, 6, 1, C.skinDark);
  // 目（前方寄り1つ）
  pset(bx + 2, y + 8, 1, 2, C.eye);
  // 後頭部の髪
  pset(bx + 5, y + 6, 2, 4, C.hair);

  // 麦わら帽子（横）
  pset(bx, y + 5, 9, 2, C.hatDark); // つば（前に長い）
  pset(bx + 1, y + 4, 6, 1, C.hat);
  pset(bx + 1, y, 5, 4, C.hat); // 山
  pset(bx + 1, y, 5, 1, C.hatDark);
  pset(bx + 2, y + 1, 3, 1, "#f3da95");
  pset(bx + 1, y + 4, 5, 1, C.hatBand);

  ctx.restore();
}

function drawBattle() {
  const fish = state.currentFish;
  const rare = fish?.rarity === "rare" || fish?.rarity === "legendary";
  updateBattleOverlay();
  ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, 0, elements.canvas.height);
  gradient.addColorStop(0, rare ? "#241c5c" : "#75cfe3");
  gradient.addColorStop(0.56, rare ? "#5846a8" : "#bfeff7");
  gradient.addColorStop(1, rare ? "#151935" : "#1b7f93");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

  ctx.save();
  drawBubbles(rare);
  drawReefFloor(rare);
  ctx.restore();
}

function drawBubbles(rare) {
  ctx.fillStyle = rare ? "rgba(255, 232, 130, 0.28)" : "rgba(255, 255, 255, 0.32)";
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 71 + state.frame * (i % 3 + 1)) % elements.canvas.width;
    const y = (i * 43 - state.frame * (i % 4 + 1) + 700) % elements.canvas.height;
    const r = 4 + (i % 5);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawReefFloor(rare) {
  const baseY = elements.canvas.height - 82;
  ctx.fillStyle = rare ? "rgba(31, 23, 70, 0.62)" : "rgba(17, 91, 101, 0.58)";
  ctx.fillRect(0, baseY, elements.canvas.width, 82);
  for (let i = 0; i < 12; i += 1) {
    const x = i * 70 + 18;
    const h = 22 + (i % 4) * 12;
    ctx.fillStyle = i % 2 === 0 ? "#ef735f" : "#e8c56e";
    ctx.fillRect(x, baseY + 52 - h, 16, h);
    ctx.fillRect(x - 8, baseY + 48 - h, 10, Math.max(12, h - 10));
  }
}

function createAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  const ctxAudio = new AudioContext();
  const gain = ctxAudio.createGain();
  gain.gain.value = 0.04;
  gain.connect(ctxAudio.destination);
  return { ctx: ctxAudio, gain, timer: null };
}

function unlockAudio() {
  if (!state.soundOn) return;
  if (!state.audio) state.audio = createAudio();
  if (state.audio?.ctx?.state === "suspended") state.audio.ctx.resume();
}

function playMapBgm() {
  playBgm(`map:${state.currentMap}`, mapBgmSources[state.currentMap], 0.34);
}

function playBattleBgm(mode) {
  const src = battleBgmSources[mode] || battleBgmSources.normal;
  playBgm(`battle:${mode}`, src, mode === "rare" ? 0.46 : 0.42);
}

function playBgm(mode, src, volume) {
  if (!state.soundOn || !state.bgmOn) return;
  unlockAudio();
  if (!src) return;
  if (!state.bgm || state.bgmMode !== mode) {
    if (state.bgm) state.bgm.pause();
    state.bgm = new Audio(src);
    state.bgm.loop = true;
    state.bgmMode = mode;
    state.bgm.currentTime = 0;
  }
  state.bgm.volume = volume;
  state.bgm.playbackRate = 1;
  if (state.bgm.paused) state.bgm.play().catch(() => {});
}

function clearBgm() {
  if (state.audio) clearInterval(state.audio.timer);
  if (state.bgm) {
    state.bgm.pause();
    state.bgm.currentTime = 0;
  }
  state.bgmMode = null;
}

function playJingle(success) {
  if (!state.soundOn) return;
  unlockAudio();
  if (!state.audio) return;
  const notes = success ? [523.25, 659.25, 783.99] : [220, 196];
  notes.forEach((note, index) => {
    const osc = state.audio.ctx.createOscillator();
    const gain = state.audio.ctx.createGain();
    osc.type = "square";
    osc.frequency.value = note;
    gain.gain.setValueAtTime(0.0001, state.audio.ctx.currentTime + index * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.22, state.audio.ctx.currentTime + index * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, state.audio.ctx.currentTime + index * 0.08 + 0.16);
    osc.connect(gain);
    gain.connect(state.audio.gain);
    osc.start(state.audio.ctx.currentTime + index * 0.08);
    osc.stop(state.audio.ctx.currentTime + index * 0.08 + 0.18);
  });
}

document.addEventListener("keydown", (event) => {
  if (!elements.shopScreen.classList.contains("hidden")) {
    if (event.key === "Escape") closeShop();
    return;
  }
  if (!elements.dexScreen.classList.contains("hidden")) {
    if (event.key === "Escape") {
      if (state.dexDetailOpen) closeDexDetail();
      else closeDexScreen();
    }
    return;
  }
  const keyMap = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
  };
  const direction = keyMap[event.key];
  if (!direction) return;
  event.preventDefault();
  movePlayer(direction);
});

document.querySelector(".touch-pad").addEventListener("click", (event) => {
  const button = event.target.closest("[data-move]");
  if (!button) return;
  movePlayer(button.dataset.move);
});

elements.commandPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-command]");
  if (!button) return;
  handleCommand(button.dataset.command);
});

elements.answerList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-answer]");
  if (!button || button.disabled) return;
  answer(button.dataset.answer, button);
});

elements.areaList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-area]");
  if (!button || state.mode !== "map") return;
  const targetArea = button.dataset.area;
  if (!isAreaUnlocked(targetArea)) {
    playSfx("wrong", 0.5);
    setMessage("まだそのエリアには行けない。手前の障害をのりこえよう。");
    return;
  }
  state.currentMap = targetArea;
  const start = mapDefinitions[state.currentMap].start;
  state.player.x = start.x;
  state.player.y = start.y;
  updateAreaStatus();
  setMessage(`${getCurrentArea().name}へ移動した。画面の端から隣のマップへ進める。`);
  playMapBgm();
});

elements.menuToggle.addEventListener("click", () => {
  playSfx("menu", 0.42);
  elements.menuPanel.classList.toggle("hidden");
});

elements.dexOpenButton.addEventListener("click", openDexScreen);

elements.dexCloseButton.addEventListener("click", closeDexScreen);

elements.shopOpenButton.addEventListener("click", openShop);

elements.shopCloseButton.addEventListener("click", closeShop);

elements.shopList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy]");
  if (!button || button.disabled) return;
  buyAbility(button.dataset.buy);
});

elements.dexSearchInput.addEventListener("input", () => {
  state.dexQuery = elements.dexSearchInput.value;
  renderDex();
});

elements.dexSearchClear.addEventListener("click", () => {
  state.dexQuery = "";
  elements.dexSearchInput.value = "";
  renderDex();
});

if (elements.dexFilterToggle) {
  elements.dexFilterToggle.addEventListener("click", () => {
    setDexFilterOpen(!state.dexFilterOpen);
  });
}

if (elements.dexFilterPopup) {
  elements.dexFilterPopup.addEventListener("click", (event) => {
    if (event.target.closest("[data-dex-filter-close]")) {
      setDexFilterOpen(false);
    }
  });
}

elements.dexFilterList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-rarity]");
  if (!button) return;
  state.dexRarity = button.dataset.rarity;
  renderDex();
});

elements.dexCategoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.dexCategory = button.dataset.category;
  renderDex();
});

if (elements.dexKingdomList) {
  elements.dexKingdomList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-kingdom]");
    if (!button) return;
    state.dexKingdom = button.dataset.kingdom;
    // 大分類を変えたら、その下の分類選択はリセットする。
    state.dexCategory = "all";
    renderDex();
  });
}

if (elements.dexAreaList) {
  elements.dexAreaList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-dex-area]");
    if (!button) return;
    state.dexArea = button.dataset.dexArea;
    renderDex();
  });
}

elements.dexList.addEventListener("click", (event) => {
  const groupCard = event.target.closest("[data-group]");
  if (groupCard) {
    playSfx("menu", 0.34);
    state.dexOpenGroup = groupCard.dataset.group;
    elements.dexList.scrollTop = 0;
    renderDex();
    return;
  }

  if (event.target.closest("[data-dex-back]")) {
    playSfx("menu", 0.3);
    state.dexOpenGroup = null;
    elements.dexList.scrollTop = 0;
    renderDex();
    return;
  }

  const button = event.target.closest("[data-fish-id]");
  if (!button) return;
  openDexDetail(button.dataset.fishId);
});

elements.dexDetailScrim.addEventListener("click", () => closeDexDetail());

elements.dexDetailPanel.addEventListener("click", (event) => {
  if (!event.target.closest("[data-dex-close]")) return;
  closeDexDetail();
});

elements.soundToggle.addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  elements.soundToggle.classList.toggle("active", state.soundOn);
  if (state.soundOn) {
    unlockAudio();
    if (state.currentFish) {
      playBattleBgm(state.currentFish.rarity === "legendary" ? "legendary" : state.currentFish.rarity === "rare" ? "rare" : "normal");
    } else {
      playMapBgm();
    }
  } else {
    clearBgm();
  }
});

elements.resetButton.addEventListener("click", () => {
  if (!confirm("図鑑と正解数をリセットしますか？")) return;
  state.save = {};
  state.bonus = 0;
  state.abilities = { surf: false, light: false, cut: false, reeds: false, dive: false, ugan: false };
  state.cleared = {};
  localStorage.removeItem("mfq-save");
  localStorage.removeItem("mfq-bonus");
  renderDex();
  renderBonus();
  renderShop();
});

// 設定UIの初期表示を state に合わせる。
function syncSettingsUI() {
  elements.hiraganaToggle.setAttribute("aria-checked", String(state.hiraganaMode));
  elements.nameOnlyToggle.setAttribute("aria-checked", String(state.nameOnlyMode));
  elements.bgmToggle.setAttribute("aria-checked", String(state.bgmOn));
  // 保存済みでひらがなモードがONなら解析器を先読みしておく。
  if (state.hiraganaMode) ensureTokenizer();
}

elements.hiraganaToggle.addEventListener("click", () => {
  state.hiraganaMode = !state.hiraganaMode;
  elements.hiraganaToggle.setAttribute("aria-checked", String(state.hiraganaMode));
  saveSettings();
  playSfx("select", 0.42);
  if (state.hiraganaMode) ensureTokenizer();
  // 表示中のメッセージ・クイズを即座に切り替える。
  refreshLocalizedText();
});

elements.nameOnlyToggle.addEventListener("click", () => {
  state.nameOnlyMode = !state.nameOnlyMode;
  elements.nameOnlyToggle.setAttribute("aria-checked", String(state.nameOnlyMode));
  saveSettings();
  playSfx("select", 0.42);
});

elements.bgmToggle.addEventListener("click", () => {
  state.bgmOn = !state.bgmOn;
  elements.bgmToggle.setAttribute("aria-checked", String(state.bgmOn));
  saveSettings();
  playSfx("select", 0.42);
  if (state.bgmOn) {
    unlockAudio();
    if (state.currentFish) {
      playBattleBgm(state.currentFish.rarity === "legendary" ? "legendary" : state.currentFish.rarity === "rare" ? "rare" : "normal");
    } else {
      playMapBgm();
    }
  } else {
    clearBgm();
  }
});

syncSettingsUI();

async function loadSpecies() {
  const response = await fetch(SPECIES_URL, { cache: "no-cache" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const raw = await response.json();
  if (!Array.isArray(raw) || raw.length === 0) throw new Error("生物データが空です");
  fishData = raw.map(normalizeSpecies).filter((fish) => fish.id);
  state.selectedDexFishId = fishData[0].id;
}

function showLoadError(error) {
  console.error("生物データの読み込みに失敗:", error);
  setMessage(
    "生物データ（data/species.json）を読み込めませんでした。ページを再読み込みするか、配信サーバー越しに開いてください。"
  );
}

async function startGame() {
  try {
    await loadSpecies();
  } catch (error) {
    showLoadError(error);
    return;
  }
  loadAbilities();
  loadCleared();
  updateAreaStatus();
  renderDex();
  renderBonus();
  applyLayout();
  draw();
}

if (wideLayoutQuery.addEventListener) {
  wideLayoutQuery.addEventListener("change", applyLayout);
} else if (wideLayoutQuery.addListener) {
  wideLayoutQuery.addListener(applyLayout);
}

startGame();
