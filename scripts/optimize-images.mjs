#!/usr/bin/env node
// assets/species/<id>/source.* を main(横900px) / thumb(横240px) に変換する。
//
//   node scripts/optimize-images.mjs
//
// WebP を書ける環境（cwebp があれば優先）では .webp を、無ければ sips で
// 最適化済みリサイズ JPEG (.jpg) を出力する（macOS の sips は WebP 書き出し非対応版がある）。
// 変換後は node scripts/apply-local-images.mjs で species.json の image/thumb を差し替える。

import { readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = join(root, "assets", "species");

const MAIN_W = 900;
const THUMB_W = 240;

function has(cmd) {
  try { execFileSync("which", [cmd], { stdio: "ignore" }); return true; } catch { return false; }
}
const HAS_CWEBP = has("cwebp");
const EXT = HAS_CWEBP ? "webp" : "jpg";
console.log(`出力形式: ${EXT}${HAS_CWEBP ? " (cwebp)" : " (sips JPEG)"}`);

function toMain(input, out) {
  if (HAS_CWEBP) {
    execFileSync("cwebp", ["-quiet", "-q", "80", "-resize", String(MAIN_W), "0", input, "-o", out]);
  } else {
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "72", "-Z", String(MAIN_W), input, "--out", out], { stdio: ["ignore", "ignore", "pipe"] });
  }
}
function toThumb(input, out) {
  if (HAS_CWEBP) {
    execFileSync("cwebp", ["-quiet", "-q", "78", "-resize", String(THUMB_W), "0", input, "-o", out]);
  } else {
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "65", "-Z", String(THUMB_W), input, "--out", out], { stdio: ["ignore", "ignore", "pipe"] });
  }
}

if (!existsSync(base)) {
  console.error("assets/species がありません。");
  process.exit(1);
}

let done = 0;
let failed = 0;
for (const id of readdirSync(base)) {
  const dir = join(base, id);
  if (!statSync(dir).isDirectory()) continue;
  const src = readdirSync(dir).find((f) => f.startsWith("source."));
  if (!src) continue;
  const input = join(dir, src);
  const main = join(dir, `main.${EXT}`);
  const thumb = join(dir, `thumb.${EXT}`);
  try {
    toMain(input, main);
    toThumb(main, thumb);
    done += 1;
  } catch (error) {
    failed += 1;
    console.warn(`✗ ${id}: ${String(error.message).split("\n")[0]}`);
  }
}

console.log(`変換 ${done} 種 / 失敗 ${failed}`);
