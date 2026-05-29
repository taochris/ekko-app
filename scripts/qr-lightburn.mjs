#!/usr/bin/env node
/**
 * Génère un SVG compatible LightBurn pour gravure laser.
 *
 * Couches (couleurs LightBurn) :
 *   - NOIR (#000000)  → Gravure remplissage : modules QR + texte EKKO
 *   - ROUGE (#FF0000) → Découpe contour : contour plaque (bords arrondis)
 *
 * Dimensions :
 *   - Plaque : 40 × 45 mm, coins arrondis r=2mm
 *   - QR : 25 × 25 mm centré horizontalement, 4mm du haut
 *   - EKKO : centré sous le QR, 3mm d'écart
 *
 * Usage :
 *   node scripts/qr-lightburn.mjs <echoId>
 *   node scripts/qr-lightburn.mjs <echoId> --url <fullUrl>
 *
 * Le SVG est exporté dans ./qr-output/
 */

import QRCode from "qrcode";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "..", "qr-output");

// ─── Dimensions (mm) ────────────────────────────────────────────────────
const PLATE_W = 40;        // largeur plaque
const PLATE_L = 45;        // longueur plaque
const CORNER_R = 2;        // rayon bords arrondis

const QR_SIZE = 25;        // côté zone QR

const BASE_URL = "https://www.vosekko.com/v/";

// ─── CLI ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "--help") {
  console.log(`
Usage: node scripts/qr-lightburn.mjs <echoId> [--url <fullUrl>]

Génère un SVG pour LightBurn (gravure + découpe) dans ./qr-output/
  Noir  = gravure (QR + EKKO)
  Rouge = découpe (contour plaque)
`);
  process.exit(0);
}

let echoId = args[0];
let url = null;
for (let i = 1; i < args.length; i++) {
  if (args[i] === "--url" && args[i + 1]) { url = args[++i]; }
}
if (!url) url = BASE_URL + echoId;

// ─── Génération QR ──────────────────────────────────────────────────────
const qrData = await QRCode.create(url, { errorCorrectionLevel: "M" });
const modules = qrData.modules;
const moduleCount = modules.size;
const moduleSize = QR_SIZE / moduleCount;

// Position QR centrée horizontalement, 4mm du bord haut
const qrOffsetX = (PLATE_W - QR_SIZE) / 2;
const qrOffsetY = 4;

// ─── Construction SVG ───────────────────────────────────────────────────
const svgParts = [];

// En-tête SVG — unité mm
svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${PLATE_W}mm" height="${PLATE_L}mm"
     viewBox="0 0 ${PLATE_W} ${PLATE_L}">
`);

// ── 1. Contour plaque (DÉCOUPE — rouge) ──
svgParts.push(`  <!-- Contour plaque — DÉCOUPE (rouge) -->
  <rect x="0" y="0" width="${PLATE_W}" height="${PLATE_L}"
        rx="${CORNER_R}" ry="${CORNER_R}"
        fill="none" stroke="#FF0000" stroke-width="0.1" />
`);

// ── 2. Modules QR (GRAVURE — noir, rempli) ──
svgParts.push(`  <!-- Modules QR — GRAVURE (noir) -->\n`);
svgParts.push(`  <g fill="#000000" stroke="none">\n`);

for (let row = 0; row < moduleCount; row++) {
  for (let col = 0; col < moduleCount; col++) {
    if (modules.get(col, row)) {
      const x = qrOffsetX + col * moduleSize;
      const y = qrOffsetY + row * moduleSize;
      svgParts.push(`    <rect x="${x.toFixed(4)}" y="${y.toFixed(4)}" width="${moduleSize.toFixed(4)}" height="${moduleSize.toFixed(4)}" />\n`);
    }
  }
}
svgParts.push(`  </g>\n`);

// ── 3. Texte EKKO (GRAVURE — noir) ──
// Police épaisse, lettres en paths SVG pour être compatibles LightBurn
// (LightBurn ne rend pas toujours les polices correctement, mieux vaut des paths)

const charH = 4;       // hauteur caractère mm
const charGap = 0.8;   // espace entre lettres mm
const STROKE = 0.16;   // épaisseur trait (fraction de hauteur)
const S = STROKE;

// Glyphes en chemins fermés (coordonnées normalisées 0..1 en hauteur)
// Chaque lettre = liste de rectangles/polygones [points]
const GLYPHS = {
  E: [
    // Fût vertical
    [[0, 0], [S, 0], [S, 1], [0, 1]],
    // Bras haut
    [[0, 0], [0.60, 0], [0.60, S], [0, S]],
    // Bras médian
    [[0, 0.5 - S/2], [0.48, 0.5 - S/2], [0.48, 0.5 + S/2], [0, 0.5 + S/2]],
    // Bras bas
    [[0, 1 - S], [0.60, 1 - S], [0.60, 1], [0, 1]],
  ],
  K: [
    // Fût vertical
    [[0, 0], [S, 0], [S, 1], [0, 1]],
    // Branche montante (vers haut-droite) — épaisse
    [[S, 0.45], [S, 0.55], [0.62, 0], [0.72, 0]],
    // Branche descendante (vers bas-droite) — épaisse
    [[S, 0.45], [0.72, 1], [0.62, 1], [S, 0.55]],
  ],
  O: [
    // Barre gauche
    [[0, S], [S, S], [S, 1 - S], [0, 1 - S]],
    // Barre droite
    [[0.72 - S, S], [0.72, S], [0.72, 1 - S], [0.72 - S, 1 - S]],
    // Barre haut
    [[0, 0], [0.72, 0], [0.72, S], [0, S]],
    // Barre bas
    [[0, 1 - S], [0.72, 1 - S], [0.72, 1], [0, 1]],
  ],
};

const GLYPH_ADVANCE = { E: 0.65, K: 0.72, O: 0.72 };

const textWord = "EKKO";

// Largeur totale du mot
let totalTextW = 0;
for (const ch of textWord) {
  totalTextW += (GLYPH_ADVANCE[ch] ?? 0.6) * charH;
}
totalTextW += (textWord.length - 1) * charGap;

const textStartX = (PLATE_W - totalTextW) / 2;
const textStartY = qrOffsetY + QR_SIZE + 3; // 3mm sous le QR

svgParts.push(`\n  <!-- Texte EKKO — GRAVURE (noir) -->\n`);
svgParts.push(`  <g fill="#000000" stroke="none">\n`);

let cursorX = textStartX;
for (const ch of textWord) {
  const glyphPolys = GLYPHS[ch];
  const advance = (GLYPH_ADVANCE[ch] ?? 0.6) * charH;
  if (glyphPolys) {
    for (const poly of glyphPolys) {
      // Mise à l'échelle et positionnement
      const points = poly.map(([px, py]) => {
        const x = cursorX + px * charH;
        const y = textStartY + py * charH;
        return `${x.toFixed(3)},${y.toFixed(3)}`;
      }).join(" ");
      svgParts.push(`    <polygon points="${points}" />\n`);
    }
  }
  cursorX += advance + charGap;
}

svgParts.push(`  </g>\n`);

// Fermeture SVG
svgParts.push(`</svg>\n`);

// ─── Export ─────────────────────────────────────────────────────────────
mkdirSync(OUTPUT_DIR, { recursive: true });
const filename = `ekko-qr-${echoId.slice(0, 8)}.svg`;
const filepath = join(OUTPUT_DIR, filename);
writeFileSync(filepath, svgParts.join(""), "utf-8");

console.log(`✅ SVG généré : ${filepath}`);
console.log(`   Plaque : ${PLATE_W}×${PLATE_L} mm (coins arrondis r=${CORNER_R}mm)`);
console.log(`   QR     : ${QR_SIZE}×${QR_SIZE}mm (${moduleCount}×${moduleCount} modules)`);
console.log(`   EKKO   : centré sous QR, traits épais`);
console.log(`   URL    : ${url}`);
console.log(`\n🔥 Couches LightBurn :`);
console.log(`   NOIR (#000000) → Gravure remplissage (QR + texte)`);
console.log(`   ROUGE (#FF0000) → Découpe contour (plaque)`);
console.log(`\n💡 Dans LightBurn :`);
console.log(`   1. Importer le SVG`);
console.log(`   2. Couche noire → mode "Fill" (gravure)`);
console.log(`   3. Couche rouge → mode "Line" (découpe)`);
console.log(`   4. Régler puissance/vitesse selon votre matériau`);
