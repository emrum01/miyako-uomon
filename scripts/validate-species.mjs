#!/usr/bin/env node
// data/species.json をスキーマ検証する。
//   node scripts/validate-species.mjs
// 問題があれば一覧を表示して終了コード 1 を返す。

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(root, "data", "species.json");

const AREAS = new Set(["port", "beach", "reef", "offshore"]);
const RARITY = new Set(["common", "uncommon", "rare"]);
const QUIZ_KEYS = new Set(["name", "category", "habitat", "diet", "behavior", "feature"]);
const REQUIRED_STR = [
  "id", "nameJa", "localName", "scientificName", "kingdomGroup", "family",
  "categoryId", "categoryName", "categoryNote", "rarity",
  "habitat", "behavior", "feature", "danger",
];

let data;
try {
  data = JSON.parse(readFileSync(file, "utf8"));
} catch (error) {
  console.error(`✗ JSONを読めません: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error("✗ ルートは配列である必要があります。");
  process.exit(1);
}

const errors = [];
const ids = new Set();

data.forEach((sp, index) => {
  const where = `#${index} (${sp?.id ?? "no-id"})`;
  for (const key of REQUIRED_STR) {
    if (typeof sp?.[key] !== "string" || !sp[key].trim()) {
      errors.push(`${where}: 必須文字列 "${key}" が空または不正`);
    }
  }
  if (!RARITY.has(sp?.rarity)) errors.push(`${where}: rarity が不正 (${sp?.rarity})`);
  if (!Array.isArray(sp?.areas) || sp.areas.length === 0) {
    errors.push(`${where}: areas が空`);
  } else if (sp.areas.some((a) => !AREAS.has(a))) {
    errors.push(`${where}: areas に未知のエリア (${sp.areas.join(",")})`);
  }
  if (sp?.id) {
    if (ids.has(sp.id)) errors.push(`${where}: id が重複`);
    ids.add(sp.id);
  }
  if (sp?.quizFacts !== undefined) {
    if (!Array.isArray(sp.quizFacts)) {
      errors.push(`${where}: quizFacts は配列であるべき`);
    } else {
      for (const f of sp.quizFacts) {
        if (!QUIZ_KEYS.has(f)) errors.push(`${where}: quizFacts に未知のキー "${f}"`);
      }
      if (sp.quizFacts.includes("diet") && (!sp.diet || !sp.diet.trim())) {
        errors.push(`${where}: diet が空なのに quizFacts に "diet" が含まれる`);
      }
    }
  }
  if (sp?.diet !== undefined && typeof sp.diet !== "string") {
    errors.push(`${where}: diet は文字列であるべき`);
  }
});

const groups = {};
for (const sp of data) {
  groups[sp.kingdomGroup] = (groups[sp.kingdomGroup] || 0) + 1;
}

console.log(`種数: ${data.length}`);
console.log("大分類ごと:", groups);

if (errors.length) {
  console.error(`\n✗ ${errors.length}件の問題:`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("✓ 検証OK");
