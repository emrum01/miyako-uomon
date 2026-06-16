#!/usr/bin/env node
// assets/species/<id>/source.* を main.webp(横900px) / thumb.webp(横240px) に変換する（macOSの sips 使用）。
//
//   node scripts/optimize-images.mjs
//
// 変換後、data/species.json の image / thumb を ./assets/species/<id>/main.webp などに
// 手動で差し替えるか、別途スクリプトで一括更新してください。
// sips は WebP 出力に対応（macOS 11+）。未対応環境では cwebp 等に置き換えてください。

import { readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = join(root, "assets", "species");

const MAIN_W = 900;
const THUMB_W = 240;

function sips(...a) {
  return execFileSync("sips", a, { stdio: ["ignore", "ignore", "pipe"] });
}

if (!existsSync(base)) {
  console.error("assets/species がありません。");
  process.exit(1);
}

let done = 0;
for (const id of readdirSync(base)) {
  const dir = join(base, id);
  if (!statSync(dir).isDirectory()) continue;
  const src = readdirSync(dir).find((f) => f.startsWith("source."));
  if (!src) continue;
  const input = join(dir, src);
  const main = join(dir, "main.webp");
  const thumb = join(dir, "thumb.webp");
  try {
    sips("-s", "format", "webp", "-Z", String(MAIN_W), input, "--out", main);
    sips("-s", "format", "webp", "-Z", String(THUMB_W), main, "--out", thumb);
    done += 1;
    console.log(`✓ ${id}: main.webp / thumb.webp`);
  } catch (error) {
    console.warn(`✗ ${id}: ${error.message}`);
  }
}

console.log(`\n変換 ${done} 種。`);
