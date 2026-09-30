#!/usr/bin/env node
// .agents/hooks/contrast.js
// WCAG contrast checker. Read-only.
// Usage: node .agents/hooks/contrast.js <foreground-hex> <background-hex>
// Example: node .agents/hooks/contrast.js "#1f2937" "#ffffff"
// Prints the ratio and whether it passes AA for normal text (4.5:1) and for
// large text / UI components (3:1). Exit code 0 if normal-text AA passes, 1 if not.

function parse(hex) {
  let h = String(hex || "").trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    console.error(`Invalid hex colour: "${hex}". Use forms like #1f2937 or #fff.`);
    process.exit(2);
  }
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const [fg, bg] = process.argv.slice(2);
if (!fg || !bg) {
  console.error("Usage: node .agents/hooks/contrast.js <foreground-hex> <background-hex>");
  process.exit(2);
}

const l1 = luminance(parse(fg));
const l2 = luminance(parse(bg));
const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
const text = ratio >= 4.5;
const ui = ratio >= 3;

console.log(`${fg} on ${bg}: ${ratio.toFixed(2)}:1`);
console.log(`  normal text (4.5:1):             ${text ? "PASS" : "FAIL"}`);
console.log(`  large text / UI parts (3:1):     ${ui ? "PASS" : "FAIL"}`);
process.exit(text ? 0 : 1);
