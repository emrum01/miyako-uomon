const fishData = [
  {
    id: "gurukun",
    name: "グルクン",
    localName: "タカサゴ",
    scientific: "Pterocaesio digramma",
    categoryId: "takasago",
    categoryName: "タカサゴ科",
    categoryNote: "細長い体で群れを作る、サンゴ礁まわりの中層遊泳タイプ。",
    rarity: "common",
    areas: ["port", "reef"],
    habitat: "サンゴ礁のまわりで群れを作り、中層を泳ぐ。",
    diet: "動物プランクトンを食べる。",
    behavior: "群れで素早く泳ぎ、外敵から身を守る。",
    feature: "沖縄県魚。水中では銀色の群れが一枚のカーテンみたいに向きを変え、食卓では唐揚げで一気に主役になる。",
    danger: "低い",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pterocaesio%20digramma%20GBR.jpg",
    source: "https://www.fishbase.se/summary/speciessummary.php?id=933",
  },
  {
    id: "irabucha",
    name: "イラブチャー",
    localName: "ブダイ類",
    scientific: "Chlorurus sordidus",
    categoryId: "budai",
    categoryName: "ブダイ科",
    categoryNote: "くちばし状の歯で藻類や岩肌をかじる、サンゴ礁の草食・雑食タイプ。",
    rarity: "common",
    areas: ["beach", "reef"],
    habitat: "浅いサンゴ礁や礁池に多い。",
    diet: "サンゴ岩の表面の藻類をかじり取る。",
    behavior: "くちばし状の歯で岩を削り、砂づくりにも関わる。",
    feature: "くちばしで岩をガリガリ削るサンゴ礁の庭師。かじった岩やサンゴ片が、白い砂浜の材料になることがある。",
    danger: "低い",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chlorurus%20sordidus%20by%20Jaroslaw%20Barski.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Chlorurus_sordidus_by_Jaroslaw_Barski.jpg",
  },
  {
    id: "akajin",
    name: "アカジンミーバイ",
    localName: "スジアラ",
    scientific: "Variola louti",
    categoryId: "hata",
    categoryName: "ハタ科",
    categoryNote: "岩陰や根につく肉食魚。待ち伏せして獲物を狙うタイプ。",
    rarity: "rare",
    areas: ["reef", "offshore"],
    habitat: "透明度の高い外洋寄りのサンゴ礁にいる。",
    diet: "小魚、カニ、エビなどを食べる。",
    behavior: "岩陰や根の近くで待ち伏せし、獲物を狙う。",
    feature: "派手な赤色なのに、狩りは忍者型。根のそばでじっと待ち、近づいた獲物に一気に飛び出す。",
    danger: "地域によりシガテラ毒の注意",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Serranidae%20Variola%20louti%201.jpg",
    source: "https://fishbase.se/summary/Variola-louti",
  },
  {
    id: "taman",
    name: "タマン",
    localName: "ハマフエフキ",
    scientific: "Lethrinus nebulosus",
    categoryId: "fuefuki",
    categoryName: "フエフキダイ科",
    categoryNote: "砂地や礁縁を動き、底のカニ・貝・小魚を探す底物タイプ。",
    rarity: "uncommon",
    areas: ["beach", "offshore"],
    habitat: "砂地、海草場、サンゴ礁の縁を行き来する。",
    diet: "カニ、貝、小魚など底の生き物を食べる。",
    behavior: "夜に活発になり、底付近を探りながら餌を探す。",
    feature: "昼は控えめ、夜は砂地のパトロール隊。暗くなると底を探りながら、硬いカニや貝まで食べる。",
    danger: "低い",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Lethrinus%20nebulosus%20287497294%20%28cropped%29.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Lethrinus_nebulosus_287497294_(cropped).jpg",
  },
  {
    id: "kumanomi",
    name: "クマノミ",
    localName: "クマノミ類",
    scientific: "Amphiprion clarkii",
    categoryId: "suzumedai",
    categoryName: "スズメダイ科",
    categoryNote: "小型でなわばり性が強い仲間。クマノミ類はイソギンチャクと深く関わる。",
    rarity: "uncommon",
    areas: ["beach", "reef"],
    habitat: "イソギンチャクの近くや浅いサンゴ礁にいる。",
    diet: "小さな動物や藻類などを食べる雑食性。",
    behavior: "イソギンチャクと共生し、卵は雄が世話をする。",
    feature: "毒のあるイソギンチャクを家にする魚。卵の世話は雄が担当し、ヒレで新鮮な水を送る。",
    danger: "低い",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Amphiprion%20clarkii%20sipadan.jpg",
    source: "https://fishbase.se/summary/Amphiprion-clarkii",
  },
  {
    id: "harisenbon",
    name: "ハリセンボン",
    localName: "アバサー",
    scientific: "Diodon holocanthus",
    categoryId: "harisenbon",
    categoryName: "ハリセンボン科",
    categoryNote: "硬いくちばしとふくらむ体で身を守る、夜行性寄りの底生動物ハンター。",
    rarity: "rare",
    areas: ["reef", "offshore"],
    habitat: "浅い礁や岩場、砂地にも現れる。",
    diet: "夜に貝、ウニ、ヤドカリ、カニなどを食べる。",
    behavior: "泳ぎは得意ではなく、危険を感じると体をふくらませる。",
    feature: "ふだんはのんびり、ピンチになると風船みたいに変身。針を立てて、食べにくい相手になる。",
    danger: "取り扱い注意",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Diodon%20holocanthus%20in%20kona%202.jpg",
    source: "https://fishbase.org/summary/4659",
  },
  {
    id: "kurosora",
    name: "クロソラスズメダイ",
    localName: "ファーマーフィッシュ",
    scientific: "Stegastes nigricans",
    categoryId: "suzumedai",
    categoryName: "スズメダイ科",
    categoryNote: "小型でなわばり性が強い仲間。クロソラスズメダイは藻の畑を守る。",
    rarity: "uncommon",
    areas: ["beach", "reef"],
    habitat: "浅いサンゴ礁の礁原や礁池で、なわばりを持って暮らす。",
    diet: "自分のなわばりで育てた糸状の藻類などを食べる。",
    behavior: "不要な藻を抜き、藻を食べに来る魚やウニを追い払って、自分の藻の畑を守る。",
    feature: "海の中で農業をする魚。好きな藻を残し、邪魔な藻を取り除き、畑に近づく相手には小さな体で突撃する。",
    danger: "なわばりに近づくと噛みつくことがある",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Stegastes%20nigricans%201.jpg",
    source: "https://www.fishbase.se/summary/stegastes-nigricans",
  },
];

const areas = [
  { id: "port", name: "平良港", description: "桟橋の近く。群れの魚が多い", color: "#5aaec0" },
  { id: "beach", name: "与那覇前浜", description: "白砂の浅場。小型魚と砂地の魚", color: "#e8c56e" },
  { id: "reef", name: "八重干瀬", description: "サンゴ礁。習性の違いが出やすい", color: "#ef735f" },
  { id: "offshore", name: "伊良部沖", description: "深場。レア魚の気配がある", color: "#155f8a" },
];

const quizTypes = [
  {
    key: "name",
    label: "名前",
    question: () => "この魚の名前は？",
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
const playerStart = { x: 10, y: 10 };
const battleBgmSources = {
  normal: "./assets/audio/battle-umi-no-himitsugyo.mp3",
  rare: "./assets/audio/rare-shinkai-no-sogu.mp3",
};
const mapBgmSources = {
  port: "./assets/audio/maps/port-taira.mp3",
  beach: "./assets/audio/maps/beach-yonaha-maehama.mp3",
  reef: "./assets/audio/maps/reef-yaebiji.mp3",
  offshore: "./assets/audio/maps/offshore-irabu-drift.mp3",
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
    exits: { right: "beach" },
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
    exits: { left: "reef" },
    start: { x: 2, y: 10 },
  },
};

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
  dexFilterList: document.querySelector("#dexFilterList"),
  dexCategoryList: document.querySelector("#dexCategoryList"),
  dexList: document.querySelector("#dexList"),
  dexDetailScrim: document.querySelector("#dexDetailScrim"),
  dexDetailPanel: document.querySelector("#dexDetailPanel"),
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
  dexQuery: "",
  dexRarity: "all",
  dexCategory: "all",
  selectedDexFishId: fishData[0].id,
  dexDetailOpen: false,
};

const fishImages = new Map();
for (const fish of fishData) {
  const img = new Image();
  img.src = fish.image;
  fishImages.set(fish.id, img);
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

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function maxHpFor(fish) {
  if (fish.rarity === "rare") return 5;
  if (fish.rarity === "uncommon") return 4;
  return 3;
}

function rewardFor(fish) {
  if (fish.rarity === "rare") return 80;
  if (fish.rarity === "uncommon") return 35;
  return 15;
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
  elements.enemyRarity.textContent = fish.rarity.toUpperCase();
  elements.enemyRarity.className = `enemy-rarity ${fish.rarity === "rare" ? "rare" : ""}`;
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

function tileKey(x, y) {
  return `${x},${y}`;
}

function blockedTilesFor(mapId) {
  const blocked = new Set();
  if (mapId === "port") {
    for (let x = 0; x < mapCols; x += 1) blocked.add(tileKey(x, 0));
    for (let y = 0; y < mapRows; y += 1) blocked.add(tileKey(0, y));
    [tileKey(3, 4), tileKey(4, 4), tileKey(15, 14), tileKey(16, 14)].forEach((tile) => blocked.add(tile));
  }
  if (mapId === "beach") {
    [tileKey(4, 3), tileKey(15, 4), tileKey(6, 15), tileKey(14, 15)].forEach((tile) => blocked.add(tile));
  }
  if (mapId === "reef") {
    [tileKey(5, 5), tileKey(6, 5), tileKey(13, 7), tileKey(14, 7), tileKey(8, 14), tileKey(15, 15)].forEach((tile) => blocked.add(tile));
  }
  if (mapId === "offshore") {
    [tileKey(4, 4), tileKey(5, 4), tileKey(14, 12), tileKey(15, 12)].forEach((tile) => blocked.add(tile));
  }
  return blocked;
}

function isBlocked(x, y) {
  return blockedTilesFor(state.currentMap).has(tileKey(x, y));
}

function pickWeightedFish(areaId) {
  const pool = fishData.filter((fish) => fish.areas.includes(areaId));
  const weighted = pool.flatMap((fish) => {
    if (fish.rarity === "rare") return [fish];
    if (fish.rarity === "uncommon") return [fish, fish, fish];
    return [fish, fish, fish, fish, fish];
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function buildQuiz(fish, options = {}) {
  const availableQuizTypes = quizTypes.filter((quiz) => {
    if (options.forceName) return quiz.key === "name";
    if (options.skipName) return quiz.key !== "name";
    return true;
  });
  const quiz = availableQuizTypes[Math.floor(Math.random() * availableQuizTypes.length)];
  const wrongAnswers = shuffle(
    fishData
      .filter((item) => item.id !== fish.id)
      .map((item) => item[quiz.key])
  ).slice(0, 3);

  return {
    type: quiz,
    answer: fish[quiz.key],
    choices: shuffle([fish[quiz.key], ...wrongAnswers]),
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
  elements.messageBox.innerHTML = message;
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

function renderDex() {
  const caught = fishData.filter((fish) => state.save[fish.id]?.caught > 0).length;
  elements.caughtCount.textContent = `${caught} / ${fishData.length}`;
  const filteredFish = getFilteredFish();
  if (!filteredFish.some((fish) => fish.id === state.selectedDexFishId)) {
    state.selectedDexFishId = filteredFish[0]?.id || fishData[0].id;
  }
  const visibleFish = filteredFish.slice(0, 160);

  elements.dexList.innerHTML = visibleFish.length
    ? `${filteredFish.length > visibleFish.length ? `<p class="dex-empty">該当 ${filteredFish.length}件中 ${visibleFish.length}件を表示中。検索すると絞り込めます。</p>` : ""}${visibleFish
    .map((fish) => {
      const record = state.save[fish.id] || { caught: 0, correct: 0, seen: 0 };
      const locked = record.caught === 0;
      const level = Math.min(4, record.correct);
      const title = locked ? "未捕獲" : `${fish.name}（${fish.localName}）`;
      const detail = locked
        ? `${fish.categoryName} / ${fish.rarity.toUpperCase()} / 遭遇 ${record.seen || 0}回`
        : `${fish.categoryName} / 知識Lv.${level} / 捕獲${record.caught}`;
      const selected = fish.id === state.selectedDexFishId ? "selected" : "";

      return `
        <button class="dex-card selectable ${locked ? "locked" : ""} ${selected}" type="button" data-fish-id="${fish.id}">
          <img src="${fish.image}" alt="${fish.name}" loading="lazy" />
          <div>
            <h3>${title}</h3>
            <p>${detail}</p>
          </div>
        </button>
      `;
    })
    .join("")}`
    : `<p class="dex-empty">条件に合う魚がいません。検索語やフィルタを変えてください。</p>`;

  if (state.dexDetailOpen) renderDexDetail();
  renderDexFilters();
}

function getFilteredFish() {
  const query = state.dexQuery.trim().toLowerCase();
  return fishData.filter((fish) => {
    const rarityMatch = state.dexRarity === "all" || fish.rarity === state.dexRarity;
    if (!rarityMatch) return false;
    const categoryMatch = state.dexCategory === "all" || fish.categoryId === state.dexCategory;
    if (!categoryMatch) return false;
    if (!query) return true;
    const text = [
      fish.name,
      fish.localName,
      fish.scientific,
      fish.rarity,
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
    if (!categories.has(fish.categoryId)) {
      categories.set(fish.categoryId, fish.categoryName);
    }
  });
  return [...categories.entries()].map(([id, name]) => ({ id, name }));
}

function fishAreasText(fish) {
  return fish.areas
    .map((areaId) => areas.find((area) => area.id === areaId)?.name)
    .filter(Boolean)
    .join("・");
}

function fishHabitNote(fish) {
  return `${fish.name}は${fish.categoryName}の魚。${fish.categoryNote}${fish.habitat}${fish.diet}${fish.behavior} ${fish.feature} 危険度や扱いの目安は「${fish.danger}」。`;
}

function renderDexDetail() {
  const fish = fishData.find((item) => item.id === state.selectedDexFishId) || fishData[0];
  const record = state.save[fish.id] || { caught: 0, correct: 0, seen: 0 };
  const locked = record.caught === 0;
  const level = Math.min(4, record.correct);
  const title = locked ? "未捕獲" : `${fish.name}（${fish.localName}）`;
  const subtitle = locked
    ? `${fish.categoryName} / ${fish.rarity.toUpperCase()} / 遭遇 ${record.seen || 0}回`
    : `${fish.categoryName} / 知識Lv.${level} / 捕獲${record.caught} / 正解${record.correct}`;
  const detailBody = locked
    ? `<p class="dex-hint">捕獲すると、おもしろ習性・すみか・食べもの・行動がここに記録される。</p>`
    : `
      <p class="dex-feature">${fish.feature}</p>
      <p class="dex-habit-note">${fishHabitNote(fish)}</p>
      <dl class="dex-detail">
        <div><dt>レア度</dt><dd>${fish.rarity.toUpperCase()}</dd></div>
        <div><dt>分類</dt><dd>${fish.categoryName}。${fish.categoryNote}</dd></div>
        <div><dt>HP</dt><dd>${maxHpFor(fish)}</dd></div>
        <div><dt>出現</dt><dd>${fishAreasText(fish)}</dd></div>
        <div><dt>すみか</dt><dd>${fish.habitat}</dd></div>
        <div><dt>食べもの</dt><dd>${fish.diet}</dd></div>
        <div><dt>行動</dt><dd>${fish.behavior}</dd></div>
        <div><dt>注意</dt><dd>${fish.danger}</dd></div>
        <div><dt>学名</dt><dd>${fish.scientific}</dd></div>
      </dl>
    `;

  elements.dexDetailPanel.innerHTML = `
    <button class="dex-sheet-close" type="button" data-dex-close aria-label="詳細を閉じる">×</button>
    <div class="dex-detail-hero ${locked ? "locked" : ""}">
      <img src="${fish.image}" alt="${fish.name}" loading="lazy" />
      <div>
        <h3>${title}</h3>
        <p>${subtitle}</p>
        <div class="dex-meta-row">
          <span class="dex-pill">${fish.rarity.toUpperCase()}</span>
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
  elements.dexCategoryList.innerHTML = [
    `<button class="dex-filter-button ${state.dexCategory === "all" ? "selected" : ""}" type="button" data-category="all">全分類</button>`,
    ...getFishCategories().map((category) => (
      `<button class="dex-filter-button ${state.dexCategory === category.id ? "selected" : ""}" type="button" data-category="${category.id}">${category.name}</button>`
    )),
  ].join("");
}

function openDexScreen() {
  playSfx("menu", 0.42);
  elements.dexScreen.classList.remove("hidden");
  elements.menuPanel.classList.add("hidden");
  renderDex();
}

function closeDexScreen() {
  playSfx("menu", 0.34);
  closeDexDetail(false);
  elements.dexScreen.classList.add("hidden");
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
  if (areaId === "offshore") return 0.26;
  if (areaId === "reef") return 0.22;
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
  playSfx(fish.rarity === "rare" ? "rareEncounter" : "encounter", fish.rarity === "rare" ? 0.68 : 0.52);
  setMessage(`${fish.rarity === "rare" ? "めずらしい気配！ " : ""}なにかの魚が とびだしてきた！`);
  playBattleBgm(fish.rarity === "rare" ? "rare" : "normal");
}

function handleCommand(command) {
  unlockAudio();
  if (!state.currentFish) return;
  playSfx("select", 0.42);

  if (command === "fight") {
    state.mode = "quiz";
    elements.commandPanel.classList.add("hidden");
    const record = ensureFishSave(state.currentFish.id);
    state.currentQuiz = buildQuiz(state.currentFish, {
      forceName: record.caught === 0 && !state.nameRevealed,
      skipName: record.caught > 0 || state.nameRevealed,
    });
    renderQuiz();
    setMessage(state.currentQuiz.type.key === "name" ? "まずは名前を見きわめよう。" : `${state.currentFish.name}の習性を見きわめろ！`);
    return;
  }

  if (command === "observe") {
    const fish = state.currentFish;
    setMessage(`${state.nameRevealed ? fish.name : "この魚"}を観察した。${fish.rarity === "rare" ? "動きが鋭い。" : "落ち着いて見れば特徴がわかりそうだ。"}`);
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
  elements.questionText.textContent = state.nameRevealed || quiz.type.key === "name"
    ? rawQuestion
    : rawQuestion.replaceAll(fish.name, "この魚");
  elements.resultText.textContent = "";
  elements.answerList.innerHTML = quiz.choices
    .map((choice) => `<button class="answer-button" type="button" data-answer="${escapeHtml(choice)}">${choice}</button>`)
    .join("");
}

function transitionToNextQuiz() {
  state.mode = "transition";
  elements.quizPanel.classList.add("correct-scroll");

  setTimeout(() => {
    if (state.mode !== "transition" || !state.currentFish) return;
    const record = ensureFishSave(state.currentFish.id);
    state.currentQuiz = buildQuiz(state.currentFish, {
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
      elements.resultText.innerHTML = `正解。${fish.behavior}<br>${fish.name}を捕獲した。`;
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

    elements.resultText.innerHTML = `正解。${fish.behavior}<br>${fishDisplayName()}のHPが ${state.currentHp} まで下がった。`;
    setMessage(`${fishDisplayName()}にきいた！ HPが少し減った。あと${state.currentHp}回、習性を見きわめよう。`);
    persist();
    transitionToNextQuiz();
  } else {
    button.classList.add("wrong");
    state.wrongCount += 1;
    elements.resultText.textContent = `不正解。正解は「${state.currentQuiz.answer}」。`;
    playSfx("wrong", 0.5);
    persist();

    if (fish.rarity === "rare" && state.wrongCount >= 2) {
      setMessage(`${fishDisplayName()}に逃げられてしまった。レアな魚はミスが続くと姿を消す。`);
      state.mode = "result";
      setTimeout(() => {
        if (state.mode === "result") endEncounter("逃げられてしまった。次に出会ったら慎重に答えよう。");
      }, 2200);
      return;
    }

    const rareWarning = fish.rarity === "rare" ? ` レアな魚はあと${2 - state.wrongCount}回ミスすると逃げる。` : "";
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

  for (let y = 0; y < mapRows; y += 1) {
    for (let x = 0; x < mapCols; x += 1) {
      drawTile(x, y, state.currentMap);
    }
  }

  drawMapDecorations(state.currentMap);
  drawMapLabel();
  drawPlayer();
}

function drawTile(x, y, areaId) {
  const px = x * tileSize;
  const py = y * tileSize;
  const baseColors = {
    port: "#6db8c7",
    beach: "#ead07d",
    reef: "#63c5bd",
    offshore: "#226c9a",
  };
  ctx.fillStyle = baseColors[areaId];
  ctx.fillRect(px, py, tileSize, tileSize);

  if (areaId === "port") {
    ctx.fillStyle = "#4b9aac";
    if (y > 12) {
      ctx.fillRect(px, py, tileSize, tileSize);
      drawWaveTile(px, py, x, y, 0.18);
    }
    ctx.fillStyle = "#5f4b3e";
    if (y === 9 || y === 10) ctx.fillRect(px, py + 10, tileSize, 12);
    if (x === 9 || x === 10) ctx.fillRect(px + 10, py, 12, tileSize);
  }

  if (areaId === "beach") {
    if (y > 13) {
      ctx.fillStyle = "#79c8d8";
      ctx.fillRect(px, py, tileSize, tileSize);
      drawWaveTile(px, py, x, y, 0.24);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.32)";
      ctx.fillRect(px + 5, py + 6, 10, 4);
      ctx.fillRect(px + 18, py + 20, 8, 4);
    }
  }

  if (areaId === "reef") {
    ctx.fillStyle = "#4db3b3";
    if ((x + y) % 5 === 0) ctx.fillRect(px, py, tileSize, tileSize);
    drawWaveTile(px, py, x, y, 0.14);
    ctx.fillStyle = "#ffb08d";
    if ((x * 3 + y) % 7 === 0) ctx.fillRect(px + 6, py + 7, 7, 7);
    ctx.fillStyle = "#ffe082";
    if ((x + y * 2) % 9 === 0) ctx.fillRect(px + 19, py + 19, 6, 6);
  }

  if (areaId === "offshore") {
    ctx.fillStyle = "#1b5d87";
    if ((x + y) % 4 === 0) ctx.fillRect(px, py, tileSize, tileSize);
    drawWaveTile(px, py, x, y, 0.18);
  }

  if (isBlocked(x, y)) {
    drawObstacle(px, py, areaId);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.strokeRect(px, py, tileSize, tileSize);
}

function drawWaveTile(px, py, x, y, alpha) {
  const offset = Math.floor(state.frame / 4 + x * 5 + y * 2) % 32;
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.fillRect(px + offset - 18, py + 9, 18, 2);
  ctx.fillRect(px + ((offset + 17) % 32) - 14, py + 22, 14, 2);
}

function drawObstacle(px, py, areaId) {
  if (areaId === "beach") {
    ctx.fillStyle = "#27785f";
    ctx.fillRect(px + 12, py + 6, 8, 20);
    ctx.fillStyle = "#52a56d";
    ctx.fillRect(px + 5, py + 4, 22, 8);
    ctx.fillRect(px + 8, py + 13, 18, 7);
    return;
  }
  if (areaId === "reef") {
    ctx.fillStyle = "#ef735f";
    ctx.fillRect(px + 6, py + 12, 20, 13);
    ctx.fillStyle = "#ffe082";
    ctx.fillRect(px + 12, py + 7, 8, 8);
    return;
  }
  if (areaId === "offshore") {
    ctx.fillStyle = "#dbe9ef";
    ctx.fillRect(px + 4, py + 10, 24, 12);
    ctx.fillStyle = "#2b5d74";
    ctx.fillRect(px + 8, py + 7, 8, 6);
    return;
  }
  ctx.fillStyle = "#6b4d38";
  ctx.fillRect(px + 6, py + 8, 20, 18);
}

function drawMapDecorations(mapId) {
  if (mapId === "port") {
    ctx.fillStyle = "#79553d";
    ctx.fillRect(2 * tileSize, 9 * tileSize + 8, 15 * tileSize, 16);
    ctx.fillRect(9 * tileSize + 8, 3 * tileSize, 16, 14 * tileSize);
    ctx.fillStyle = "#f5f0d0";
    ctx.fillRect(13 * tileSize, 14 * tileSize, 42, 18);
    ctx.fillStyle = "#c8564c";
    ctx.fillRect(14 * tileSize, 13 * tileSize + 12, 18, 20);
  }
  if (mapId === "beach") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 13 * tileSize + 8, elements.canvas.width, 8);
    ctx.fillStyle = "#d8b75d";
    ctx.fillRect(2 * tileSize, 6 * tileSize, 4 * tileSize, 2 * tileSize);
  }
  if (mapId === "reef") {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(3 * tileSize, 3 * tileSize, 8 * tileSize, 5);
    ctx.fillRect(10 * tileSize, 12 * tileSize, 7 * tileSize, 5);
  }
  if (mapId === "offshore") {
    ctx.fillStyle = "#f0f7fb";
    ctx.fillRect(8 * tileSize, 8 * tileSize, 4 * tileSize, 2 * tileSize);
    ctx.fillStyle = "#384a5a";
    ctx.fillRect(9 * tileSize, 7 * tileSize + 12, 2 * tileSize, 18);
  }
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

function drawPlayer() {
  const px = state.player.x * tileSize + 8;
  const py = state.player.y * tileSize + 5 + Math.sin(state.frame / 8) * 1.5;
  ctx.save();
  ctx.fillStyle = "#1b2a37";
  ctx.fillRect(px + 5, py, 14, 12);
  ctx.fillStyle = "#f3c19b";
  ctx.fillRect(px + 8, py + 3, 8, 8);
  ctx.fillStyle = "#ef735f";
  ctx.fillRect(px + 3, py + 12, 18, 12);
  ctx.fillStyle = "#263f8f";
  ctx.fillRect(px + 5, py + 24, 6, 7);
  ctx.fillRect(px + 14, py + 24, 6, 7);
  ctx.fillStyle = "#ffffff";
  if (state.facing === "left") ctx.fillRect(px + 7, py + 6, 2, 2);
  if (state.facing === "right") ctx.fillRect(px + 15, py + 6, 2, 2);
  if (state.facing === "down") {
    ctx.fillRect(px + 8, py + 6, 2, 2);
    ctx.fillRect(px + 15, py + 6, 2, 2);
  }
  ctx.restore();
}

function drawBattle() {
  const fish = state.currentFish;
  const rare = fish?.rarity === "rare";
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
  if (!state.soundOn) return;
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
  state.currentMap = button.dataset.area;
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

elements.dexSearchInput.addEventListener("input", () => {
  state.dexQuery = elements.dexSearchInput.value;
  renderDex();
});

elements.dexSearchClear.addEventListener("click", () => {
  state.dexQuery = "";
  elements.dexSearchInput.value = "";
  renderDex();
});

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

elements.dexList.addEventListener("click", (event) => {
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
      playBattleBgm(state.currentFish.rarity === "rare" ? "rare" : "normal");
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
  localStorage.removeItem("mfq-save");
  localStorage.removeItem("mfq-bonus");
  renderDex();
  renderBonus();
});

updateAreaStatus();
renderDex();
renderBonus();
draw();
