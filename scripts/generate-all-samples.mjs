#!/usr/bin/env node
/**
 * Génère TOUS les échantillons de porte-clés pour vérification rapide :
 * 3 formats (rectangulaire, arrondi, carré) × 5 polices = 15 fichiers SVG.
 *
 * Réplique EXACTEMENT la logique de generateLightBurnSVG() dans
 * app/lib/order-emails.ts. Si tu modifies l'un, modifie l'autre.
 *
 * Usage :
 *   node scripts/generate-all-samples.mjs [nomGravé]
 *   (par défaut : "PATRICK")
 *
 * Sortie : ./qr-output/samples/
 */

import opentype from "opentype.js";
import QRCode from "qrcode";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const OUT_DIR = join(root, "qr-output", "samples");

// ─── Formats (identiques à order-emails.ts) ─────────────────────────────
const DIMS = {
  "etiquette-rect":     { w: 30,   h: 50,   rx: 3,  label: "rectangulaire" },
  "etiquette-arrondie": { w: 31.8, h: 50.8, rx: 14, label: "arrondi" },
  "carre":              { w: 40,   h: 40,   rx: 4,  label: "carre" },
};

// ─── Polices (identiques à PorteClefFinalize.tsx + order-emails.ts) ─────
const ENGRAVING_FONTS = [
  { id: "classique", family: "Georgia, serif",              file: "Georgia-Regular.ttf" },
  { id: "romain",    family: "'Cinzel', serif",             file: "Cinzel-Regular.woff" },
  { id: "cursif",    family: "'Dancing Script', cursive",   file: "DancingScript-Bold.woff" },
  { id: "bold",      family: "'Bebas Neue', sans-serif",    file: "BebasNeue-Regular.ttf" },
  { id: "arrondi",   family: "'Pacifico', cursive",         file: "Pacifico-Regular.ttf" },
];

const fontCache = {};
function loadFont(file) {
  if (fontCache[file]) return fontCache[file];
  const buf = readFileSync(join(root, "public", "fonts", file));
  const font = opentype.parse(buf.buffer);
  fontCache[file] = font;
  return font;
}

const BASE_URL = "https://www.vosekko.com/v/";

function generateSVG(engraveName, format, fontFile, fontFamily) {
  const dim = DIMS[format];
  const qrUrl = BASE_URL + "sample";

  const qr = QRCode.create(qrUrl, { errorCorrectionLevel: "M" });
  const moduleCount = qr.modules.size;

  // ── Mise en page adaptative (identique à order-emails.ts) ──
  const fontSize     = Math.min(dim.w, dim.h) * 0.10;
  const sideMargin   = Math.max(dim.w * 0.10, dim.rx * 0.45);
  const topOffset    = Math.max(dim.h * 0.08, dim.rx * 0.5);
  const gap          = Math.max(1.5, dim.h * 0.035);
  const textBandH    = fontSize * 1.3;
  const bottomMargin = Math.max(2, dim.rx * 0.4);

  const availH = dim.h - topOffset - gap - textBandH - bottomMargin;
  const availW = dim.w - sideMargin * 2;
  const qrSizeMm = Math.min(availW, availH);
  const qrX = (dim.w - qrSizeMm) / 2;
  const modSize = qrSizeMm / moduleCount;

  let d = "";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.modules.get(col, row)) {
        const mx = (qrX + col * modSize).toFixed(4);
        const my = (topOffset + row * modSize).toFixed(4);
        const ms = modSize.toFixed(4);
        d += `M${mx},${my}h${ms}v${ms}h-${ms}z`;
      }
    }
  }

  const extraGap  = (format === "etiquette-rect" || format === "etiquette-arrondie") ? 5 : 0;
  const baselineY = topOffset + qrSizeMm + gap + fontSize + extraGap;

  const font = loadFont(fontFile);
  const label = engraveName.toUpperCase();
  const textWidth = font.getAdvanceWidth(label, fontSize);
  const startX = (dim.w - textWidth) / 2;
  const glyphPath = font.getPath(label, startX, baselineY, fontSize);
  const textPathData = glyphPath.toSVG(4);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Échantillon EKKO — ${format} — ${fontFamily} — "${engraveName}" -->
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${dim.w} ${dim.h}"
     width="${dim.w}mm" height="${dim.h}mm">
  <rect x="0.3" y="0.3" width="${(dim.w - 0.6).toFixed(2)}" height="${(dim.h - 0.6).toFixed(2)}"
        rx="${dim.rx}" ry="${dim.rx}"
        fill="none" stroke="#FF0000" stroke-width="0.25"/>
  <path fill="#000000" d="${d}"/>
  <g fill="#000000">
  ${textPathData}
  </g>
</svg>`;
}

// ─── Génération ─────────────────────────────────────────────────────────
const engraveName = process.argv[2] || "PATRICK";
mkdirSync(OUT_DIR, { recursive: true });

let count = 0;
for (const [format, dim] of Object.entries(DIMS)) {
  for (const f of ENGRAVING_FONTS) {
    const svg = generateSVG(engraveName, format, f.file, f.family);
    const filename = `${dim.label}__${f.id}.svg`;
    writeFileSync(join(OUT_DIR, filename), svg);
    count++;
    console.log(`✅ ${filename.padEnd(34)} (${dim.w}×${dim.h}mm, ${f.family})`);
  }
}

console.log(`\n🎉 ${count} échantillons générés dans :`);
console.log(`   ${OUT_DIR}`);
console.log(`\n   Nom gravé : "${engraveName}"`);
console.log(`   Importe-les dans LightBurn pour vérifier police + cadre.`);
