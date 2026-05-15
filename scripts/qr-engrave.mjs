#!/usr/bin/env node
/**
 * Génère un QR code en SVG optimisé pour gravure laser (LightBurn).
 *
 * Usage :
 *   node scripts/qr-engrave.mjs <echoId>                 → fichier SVG dans ./qr-output/
 *   node scripts/qr-engrave.mjs <echoId> --size 50       → taille 50mm (défaut: 40mm)
 *   node scripts/qr-engrave.mjs <echoId> --border         → ajoute un cadre autour
 *   node scripts/qr-engrave.mjs <echoId> --url <fullUrl>  → URL personnalisée
 *
 * Le SVG généré contient :
 *   - Chaque module = un rectangle vectoriel net (pas de courbes)
 *   - Unités en mm pour import direct dans LightBurn
 *   - Calque "engrave" (remplissage) en noir
 *   - Calque "cut" (découpe du cadre) en rouge, si --border
 *   - Marge silencieuse (quiet zone) de 4 modules
 */

import QRCode from "qrcode";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "..", "qr-output");

// ─── Paramètres CLI ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "--help") {
  console.log(`
  Usage: node scripts/qr-engrave.mjs <echoId> [options]

  Options:
    --size <mm>    Taille du QR en mm (défaut: 40)
    --border       Ajouter un cadre de découpe autour
    --margin <mm>  Marge entre QR et cadre (défaut: 5)
    --url <url>    URL complète (sinon: https://www.vosekko.com/v/<echoId>)
    --out <path>   Dossier de sortie (défaut: ./qr-output/)
  `);
  process.exit(0);
}

const echoId = args[0];
const flagIdx = (f) => args.indexOf(f);
const flagVal = (f) => { const i = flagIdx(f); return i >= 0 && args[i + 1] ? args[i + 1] : null; };

const sizeMm = parseFloat(flagVal("--size") || "40");
const addBorder = args.includes("--border");
const borderMarginMm = parseFloat(flagVal("--margin") || "5");
const customUrl = flagVal("--url");
const outDir = flagVal("--out") || OUTPUT_DIR;

const url = customUrl || `https://www.vosekko.com/v/${echoId}`;

// ─── Génération QR ──────────────────────────────────────────────────────
async function generate() {
  // Obtenir la matrice du QR code
  const qr = QRCode.create(url, {
    errorCorrectionLevel: "M",
    version: undefined, // auto
  });

  const modules = qr.modules;
  const moduleCount = modules.size; // nombre de modules par côté
  const quietZone = 4; // modules de marge silencieuse (standard)
  const totalModules = moduleCount + quietZone * 2;

  const moduleSizeMm = sizeMm / totalModules;
  const qrTotalMm = sizeMm;

  console.log(`QR Code pour : ${url}`);
  console.log(`Modules : ${moduleCount}×${moduleCount}`);
  console.log(`Taille totale : ${qrTotalMm.toFixed(1)}mm (module = ${moduleSizeMm.toFixed(3)}mm)`);

  // ─── Construction SVG ───────────────────────────────────────────────
  let svgWidth = qrTotalMm;
  let svgHeight = qrTotalMm;
  let offsetX = 0;
  let offsetY = 0;

  if (addBorder) {
    svgWidth = qrTotalMm + borderMarginMm * 2;
    svgHeight = qrTotalMm + borderMarginMm * 2;
    offsetX = borderMarginMm;
    offsetY = borderMarginMm;
  }

  const rects = [];

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules.get(row, col)) {
        const x = offsetX + (quietZone + col) * moduleSizeMm;
        const y = offsetY + (quietZone + row) * moduleSizeMm;
        rects.push(
          `    <rect x="${x.toFixed(4)}" y="${y.toFixed(4)}" width="${moduleSizeMm.toFixed(4)}" height="${moduleSizeMm.toFixed(4)}"/>`
        );
      }
    }
  }

  // Position du texte EKKO sous le QR
  const textY = offsetY + qrTotalMm + 8; // 8mm sous le QR
  const textSize = 6; // 6mm de haut

  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg"`,
    `     width="${svgWidth.toFixed(2)}mm" height="${(textY + textSize + 4).toFixed(2)}mm"`,
    `     viewBox="0 0 ${svgWidth.toFixed(4)} ${(textY + textSize + 4).toFixed(4)}">`,
    ``,
    `  <!-- Calque gravure (fill/engrave dans LightBurn) -->`,
    `  <g id="engrave" fill="#000000" stroke="none">`,
    ...rects,
    `    <!-- Logo EKKO -->`,
    `    <text x="${(svgWidth / 2).toFixed(2)}" y="${textY.toFixed(2)}"`,
    `          font-family="Arial, Helvetica, sans-serif"`,
    `          font-size="${textSize}"`,
    `          font-weight="bold"`,
    `          text-anchor="middle"`,
    `          letter-spacing="0.15em">EKKO</text>`,
    `  </g>`,
  ];

  if (addBorder) {
    // Cadre de découpe — rectangle extérieur avec coins arrondis (2mm)
    const r = 2;
    const totalHeight = textY + textSize + 4;
    svg.push(``);
    svg.push(`  <!-- Calque découpe (line/cut dans LightBurn) -->`);
    svg.push(`  <g id="cut" fill="none" stroke="#FF0000" stroke-width="0.1">`);
    svg.push(`    <rect x="0" y="0" width="${svgWidth.toFixed(2)}" height="${totalHeight.toFixed(2)}" rx="${r}" ry="${r}"/>`);
    svg.push(`  </g>`);
  }

  svg.push(`</svg>`);

  // ─── Écriture fichier ─────────────────────────────────────────────
  mkdirSync(outDir, { recursive: true });
  const filename = `ekko-qr-${echoId.slice(0, 8)}.svg`;
  const filepath = join(outDir, filename);
  writeFileSync(filepath, svg.join("\n"), "utf-8");

  console.log(`\n✓ SVG généré : ${filepath}`);
  console.log(`\nImport LightBurn :`);
  console.log(`  1. Fichier > Importer > sélectionner ${filename}`);
  console.log(`  2. Calque "engrave" (noir) → mode Fill, vitesse ~1000mm/min, puissance ~30-50%`);
  if (addBorder) {
    console.log(`  3. Calque "cut" (rouge) → mode Line, vitesse ~300mm/min, puissance ~80-100%`);
  }
  console.log(`  4. Ajuster position sur le bois et lancer`);
}

generate().catch((err) => {
  console.error("Erreur:", err);
  process.exit(1);
});
