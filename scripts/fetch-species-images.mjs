#!/usr/bin/env node
// species.json の image URL から原画像を assets/species/<id>/source.* に保存する。
// その後 scripts/optimize-images.mjs で WebP 化する想定。
//
//   node scripts/fetch-species-images.mjs            # image があり未取得の種だけ
//   node scripts/fetch-species-images.mjs --force    # 既存も再取得
//   node scripts/fetch-species-images.mjs gurukun    # 特定idのみ
//
// 取得できない/image未設定の種はスキップ（アプリ側で placeholder.svg にフォールバック）。

import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const species = JSON.parse(readFileSync(join(root, "data", "species.json"), "utf8"));

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIds = args.filter((a) => !a.startsWith("--"));

function extFromUrl(url) {
  const clean = url.split("?")[0].toLowerCase();
  const m = clean.match(/\.(jpg|jpeg|png|webp|gif)$/);
  return m ? m[1].replace("jpeg", "jpg") : "jpg";
}

let ok = 0;
let skipped = 0;
let failed = 0;

for (const sp of species) {
  if (onlyIds.length && !onlyIds.includes(sp.id)) continue;
  const url = sp.image || sp.imageSource;
  if (!url || !/^https?:/.test(url)) { skipped += 1; continue; }

  const dir = join(root, "assets", "species", sp.id);
  mkdirSync(dir, { recursive: true });
  const already = existsSync(dir) && readdirSync(dir).some((f) => f.startsWith("source."));
  if (already && !force) { skipped += 1; continue; }

  try {
    const res = await fetch(url, { headers: { "User-Agent": "miyako-uomon/1.0 (educational)" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const out = join(dir, `source.${extFromUrl(url)}`);
    writeFileSync(out, buf);
    ok += 1;
    console.log(`✓ ${sp.id} <- ${url}`);
  } catch (error) {
    failed += 1;
    console.warn(`✗ ${sp.id}: ${error.message}`);
  }
}

console.log(`\n取得 ${ok} / スキップ ${skipped} / 失敗 ${failed}`);
console.log("次: node scripts/optimize-images.mjs で WebP 化してください。");
