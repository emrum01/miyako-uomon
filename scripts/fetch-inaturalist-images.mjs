#!/usr/bin/env node
// iNaturalist API から学名で画像を取得し assets/species/<id>/source.jpg に保存する。
// Wikimedia のファイル名推測と違い、学名検索なので 404 が起きにくい。
// 取得画像は CC ライセンス。撮影者の帰属・ライセンスを species.json に記録する。
//
//   node scripts/fetch-inaturalist-images.mjs           # 画像未取得の種だけ
//   node scripts/fetch-inaturalist-images.mjs --force   # 全種を再取得
//   node scripts/fetch-inaturalist-images.mjs gurukun   # 特定idのみ
//
// 取得後: node scripts/optimize-images.mjs で WebP 化し、
//         node scripts/apply-local-images.mjs で species.json の image/thumb をローカルに差し替える。

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const speciesFile = join(root, "data", "species.json");
const species = JSON.parse(readFileSync(speciesFile, "utf8"));

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIds = args.filter((a) => !a.startsWith("--"));

const UA = "miyako-uomon/1.0 (educational fish dex; contact via github emrum01/miyako-uomon)";
const API = "https://api.inaturalist.org/v1/taxa";
const THROTTLE_MS = 1200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, attempt = 0) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 429 && attempt < 4) {
    const wait = 2000 * (attempt + 1);
    console.warn(`  429 → ${wait}ms 待機して再試行`);
    await sleep(wait);
    return getJson(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// medium_url の例: https://.../medium.jpg → original を使いたいので large/original に置換
function bestPhotoUrl(photo) {
  const u = photo.medium_url || photo.url || photo.square_url;
  if (!u) return null;
  return u.replace(/\/(square|small|medium|thumb)\./, "/large.");
}

let ok = 0;
let noMatch = 0;
let skipped = 0;
let failed = 0;
let changed = false;

for (const sp of species) {
  if (onlyIds.length && !onlyIds.includes(sp.id)) continue;
  const dir = join(root, "assets", "species", sp.id);
  const already = existsSync(dir) && readdirSync(dir).some((f) => f.startsWith("source."));
  if (already && !force) { skipped += 1; continue; }
  if (!sp.scientificName) { noMatch += 1; continue; }

  try {
    const q = encodeURIComponent(sp.scientificName);
    const data = await getJson(`${API}?q=${q}&per_page=5`);
    await sleep(THROTTLE_MS);
    const wanted = sp.scientificName.toLowerCase();
    const cand =
      (data.results || []).find((t) => (t.name || "").toLowerCase() === wanted && t.default_photo) ||
      (data.results || []).find((t) => t.default_photo);
    if (!cand || !cand.default_photo) { noMatch += 1; console.warn(`– ${sp.id}: iNatに一致なし (${sp.scientificName})`); continue; }

    const photo = cand.default_photo;
    const url = bestPhotoUrl(photo);
    if (!url) { noMatch += 1; continue; }

    const img = await fetch(url, { headers: { "User-Agent": UA } });
    if (!img.ok) throw new Error(`image HTTP ${img.status}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "source.jpg"), Buffer.from(await img.arrayBuffer()));

    // 帰属・ライセンスを記録（後で表示できるように）
    sp.imageSource = url;
    if (photo.attribution) sp.imageAttribution = photo.attribution;
    if (photo.license_code) sp.imageLicense = photo.license_code;
    changed = true;
    ok += 1;
    console.log(`✓ ${sp.id} <- iNat ${cand.name} [${photo.license_code || "?"}]`);
  } catch (error) {
    failed += 1;
    console.warn(`✗ ${sp.id}: ${error.message}`);
  }
}

if (changed) {
  writeFileSync(speciesFile, JSON.stringify(species, null, 2) + "\n");
  console.log("\nspecies.json に imageSource/帰属を記録しました。");
}
console.log(`\n取得 ${ok} / 一致なし ${noMatch} / スキップ ${skipped} / 失敗 ${failed}`);
console.log("次: node scripts/optimize-images.mjs → node scripts/apply-local-images.mjs");
