#!/usr/bin/env node
/**
 * Génère un SVG compatible LightBurn pour gravure laser — FORMAT CARRÉ.
 *
 * Couches (couleurs LightBurn) :
 *   - NOIR (#000000)  → Gravure remplissage : modules QR + nom
 *   - ROUGE (#FF0000) → Découpe contour : contour plaque (bords arrondis)
 *
 * Dimensions :
 *   - Plaque : 40 × 40 mm carré, coins arrondis r=2mm
 *   - QR : 25 × 25 mm centré horizontalement, 4mm du haut
 *   - Nom : centré sous le QR, 3mm d'écart, dans le cadre
 *
 * Usage :
 *   node scripts/qr-lightburn-carre.mjs <echoId>
 *   node scripts/qr-lightburn-carre.mjs <echoId> --url <fullUrl>
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
const PLATE_L = 40;        // longueur plaque (carré)
const CORNER_R = 2;        // rayon bords arrondis (faible → aspect carré)

const QR_SIZE = 25;        // côté zone QR

const BASE_URL = "https://www.vosekko.com/v/";

// ─── CLI ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "--help") {
  console.log(`
Usage: node scripts/qr-lightburn-carre.mjs <echoId> [--url <fullUrl>]

Génère un SVG pour LightBurn (gravure + découpe) dans ./qr-output/
  Format : 40×40mm carré
  Noir  = gravure (QR + nom)
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

// ── 3. Nom personnalisé (GRAVURE — noir) ──
const textWord = (echoId.length <= 12 ? echoId : echoId.slice(0, 12)).toUpperCase();
const fontSize = 3.5;  // mm
const textX = PLATE_W / 2;
const textY = qrOffsetY + QR_SIZE + 3 + fontSize; // baseline (3mm sous le QR)

svgParts.push(`\n  <!-- Nom — GRAVURE (noir) -->\n`);
svgParts.push(`  <text x="${textX}" y="${textY.toFixed(3)}"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="#000000"
        text-anchor="middle"
        dominant-baseline="auto">${textWord}</text>\n`);

// Fermeture SVG
svgParts.push(`</svg>\n`);

// ─── Export ─────────────────────────────────────────────────────────────
mkdirSync(OUTPUT_DIR, { recursive: true });
const filename = `ekko-qr-carre-${echoId.slice(0, 8)}.svg`;
const filepath = join(OUTPUT_DIR, filename);
writeFileSync(filepath, svgParts.join(""), "utf-8");

console.log(`✅ SVG généré : ${filepath}`);
console.log(`   Plaque : ${PLATE_W}×${PLATE_L} mm carré (coins arrondis r=${CORNER_R}mm)`);
console.log(`   QR     : ${QR_SIZE}×${QR_SIZE}mm (${moduleCount}×${moduleCount} modules)`);
console.log(`   Texte  : "${textWord}" centré sous QR, dans le cadre`);
console.log(`   URL    : ${url}`);
console.log(`\n🔥 Couches LightBurn :`);
console.log(`   NOIR (#000000) → Gravure remplissage (QR + texte)`);
console.log(`   ROUGE (#FF0000) → Découpe contour (plaque)`);
console.log(`\n💡 Dans LightBurn :`);
console.log(`   1. Importer le SVG`);
console.log(`   2. Couche noire → mode "Fill" (gravure)`);
console.log(`   3. Couche rouge → mode "Line" (découpe)`);
console.log(`   4. Régler puissance/vitesse selon votre matériau`);
