#!/usr/bin/env node
// assets/species/<id>/main.webp が存在する種について、
// data/species.json の image / thumb をローカルパスへ差し替える。
// 元の画像URLは imageSource に残す（fetch-inaturalist-images.mjs が記録済み）。
// main.webp が無い種は触らない（= placeholder.svg フォールバックのまま）。
//
//   node scripts/apply-local-images.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(root, "data", "species.json");
const species = JSON.parse(readFileSync(file, "utf8"));

// webp を優先し、無ければ jpg を採用する。
const EXTS = ["webp", "jpg"];
let updated = 0;
let skipped = 0;
for (const sp of species) {
  const dir = join(root, "assets", "species", sp.id);
  const ext = EXTS.find((e) => existsSync(join(dir, `main.${e}`)));
  if (ext) {
    sp.image = `./assets/species/${sp.id}/main.${ext}`;
    if (existsSync(join(dir, `thumb.${ext}`))) sp.thumb = `./assets/species/${sp.id}/thumb.${ext}`;
    updated += 1;
  } else {
    // ローカル画像が無い種はURLのまま or 未設定（placeholderへ）。
    skipped += 1;
  }
}

writeFileSync(file, JSON.stringify(species, null, 2) + "\n");
console.log(`ローカル画像に差し替え: ${updated} 種 / 据え置き: ${skipped} 種`);
