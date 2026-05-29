#!/usr/bin/env node
/**
 * Génère un QR code en STL — mode NÉGATIF (gravure en creux).
 *
 * Résultat :
 *   - Plaque pleine : 40mm × 45mm × 8mm, bords arrondis
 *   - Modules QR : zone 25mm × 25mm, gravés en creux (3mm de profondeur)
 *   - Texte "EKKO" centré sous le QR, creux identique (3mm)
 *   - Traits de police épaissis pour bonne lisibilité en gravure
 *
 * Usage :
 *   node scripts/qr-stl.mjs <echoId>
 *   node scripts/qr-stl.mjs <echoId> --url <fullUrl>
 *
 * Le STL est exporté dans ./qr-output/
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
const PLATE_H = 8;         // épaisseur plaque
const CORNER_R = 2;        // rayon bords arrondis
const CORNER_SEG = 8;      // segments par quart de cercle

const QR_SIZE = 25;        // côté zone QR
const ENGRAVE_DEPTH = 3;   // profondeur de gravure (négatif = creux depuis le dessus)

const BASE_URL = "https://www.vosekko.com/v/";

// ─── Glyphes vectoriels style Georgia (unité = 1 = hauteur du caractère) ──
// Chaque glyphe = liste de polygones convexes [x, y] normalisés dans [0..avance] × [0..1]
// Origine = bas-gauche du caractère
const GLYPH_ADVANCE = { E: 0.65, K: 0.72, O: 0.72 };
const GLYPH_STROKE = 0.16; // épaisseur trait (plus large pour lisibilité en creux)
const S = GLYPH_STROKE;
const GLYPHS = {
  // E : fût vertical + 3 bras horizontaux
  E: [
    // Fût vertical
    [[0, 0], [S, 0], [S, 1], [0, 1]],
    // Bras haut
    [[0, 1 - S], [0.60, 1 - S], [0.60, 1], [0, 1]],
    // Bras médian
    [[0, 0.5 - S/2], [0.48, 0.5 - S/2], [0.48, 0.5 + S/2], [0, 0.5 + S/2]],
    // Bras bas
    [[0, 0], [0.60, 0], [0.60, S], [0, S]],
  ],
  // K : fût vertical + diagonales ÉPAISSES
  K: [
    // Fût vertical
    [[0, 0], [S, 0], [S, 1], [0, 1]],
    // Branche montante (de mi-hauteur vers haut-droite) — épaissie
    [[S, 0.45], [S, 0.55], [0.62, 1], [0.72, 1]],
    // Branche descendante (de mi-hauteur vers bas-droite) — épaissie
    [[S, 0.45], [0.72, 0], [0.62, 0], [S, 0.55]],
  ],
  // O : cadre rectangulaire avec traits épais
  O: [
    // Barre gauche
    [[0, S], [S, S], [S, 1 - S], [0, 1 - S]],
    // Barre droite
    [[0.72 - S, S], [0.72, S], [0.72, 1 - S], [0.72 - S, 1 - S]],
    // Barre haut
    [[0, 1 - S], [0.72, 1 - S], [0.72, 1], [0, 1]],
    // Barre bas
    [[0, 0], [0.72, 0], [0.72, S], [0, S]],
  ],
};

// ─── CLI ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "--help") {
  console.log(`
Usage: node scripts/qr-stl.mjs <echoId> [--url <fullUrl>]

Génère un fichier STL bicolore (plaque + QR + EKKO) dans ./qr-output/
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

// Position QR centrée horizontalement, dans la partie haute de la plaque
const qrOffsetX = (PLATE_W - QR_SIZE) / 2;
const qrOffsetY = 4; // 4mm du bord haut

// ─── Helpers STL (binary) ───────────────────────────────────────────────
class STLWriter {
  constructor() {
    this.triangles = [];
  }

  addTriangle(v1, v2, v3) {
    // Calcul normale (v2-v1) × (v3-v1)
    const u = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    const w = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
    const n = [
      u[1] * w[2] - u[2] * w[1],
      u[2] * w[0] - u[0] * w[2],
      u[0] * w[1] - u[1] * w[0],
    ];
    const len = Math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2) || 1;
    this.triangles.push({ n: [n[0] / len, n[1] / len, n[2] / len], v1, v2, v3 });
  }

  // Ajoute un parallélépipède (boîte) aligné aux axes
  addBox(x, y, z, w, d, h) {
    const x2 = x + w, y2 = y + d, z2 = z + h;
    // Face avant (y = y)
    this.addTriangle([x, y, z], [x2, y, z], [x2, y, z2]);
    this.addTriangle([x, y, z], [x2, y, z2], [x, y, z2]);
    // Face arrière (y = y2)
    this.addTriangle([x2, y2, z], [x, y2, z], [x, y2, z2]);
    this.addTriangle([x2, y2, z], [x, y2, z2], [x2, y2, z2]);
    // Face gauche (x = x)
    this.addTriangle([x, y2, z], [x, y, z], [x, y, z2]);
    this.addTriangle([x, y2, z], [x, y, z2], [x, y2, z2]);
    // Face droite (x = x2)
    this.addTriangle([x2, y, z], [x2, y2, z], [x2, y2, z2]);
    this.addTriangle([x2, y, z], [x2, y2, z2], [x2, y, z2]);
    // Face dessous (z = z)
    this.addTriangle([x, y, z], [x, y2, z], [x2, y2, z]);
    this.addTriangle([x, y, z], [x2, y2, z], [x2, y, z]);
    // Face dessus (z = z2)
    this.addTriangle([x, y, z2], [x2, y, z2], [x2, y2, z2]);
    this.addTriangle([x, y, z2], [x2, y2, z2], [x, y2, z2]);
  }

  // Ajoute un trou (boîte avec normales inversées — creux dans un solide)
  addHole(x, y, z, w, d, h) {
    const x2 = x + w, y2 = y + d, z2 = z + h;
    // Face avant (y = y) — normale inversée (vers +Y au lieu de -Y)
    this.addTriangle([x, y, z], [x2, y, z2], [x2, y, z]);
    this.addTriangle([x, y, z], [x, y, z2], [x2, y, z2]);
    // Face arrière (y = y2) — normale inversée
    this.addTriangle([x2, y2, z], [x, y2, z2], [x, y2, z]);
    this.addTriangle([x2, y2, z], [x2, y2, z2], [x, y2, z2]);
    // Face gauche (x = x) — normale inversée
    this.addTriangle([x, y2, z], [x, y, z2], [x, y, z]);
    this.addTriangle([x, y2, z], [x, y2, z2], [x, y, z2]);
    // Face droite (x = x2) — normale inversée
    this.addTriangle([x2, y, z], [x2, y2, z2], [x2, y2, z]);
    this.addTriangle([x2, y, z], [x2, y, z2], [x2, y2, z2]);
    // Face dessous (z = z) — normale inversée (vers +Z)
    this.addTriangle([x, y, z], [x2, y2, z], [x, y2, z]);
    this.addTriangle([x, y, z], [x2, y, z], [x2, y2, z]);
    // Face dessus (z = z2) — normale inversée (vers -Z)
    this.addTriangle([x, y, z2], [x2, y2, z2], [x2, y, z2]);
    this.addTriangle([x, y, z2], [x, y2, z2], [x2, y2, z2]);
  }

  // Plaque avec bords arrondis (extrudée en Z)
  addRoundedPlate(cx, cy, w, l, h, r, segments) {
    // Génère le contour 2D (coin arrondi)
    const pts = [];
    const hw = w / 2, hl = l / 2;

    // Parcours des 4 coins dans le sens anti-horaire
    const corners = [
      { cx: cx + hw - r, cy: cy + hl - r, a0: 0 },           // haut-droite
      { cx: cx - hw + r, cy: cy + hl - r, a0: Math.PI / 2 }, // haut-gauche
      { cx: cx - hw + r, cy: cy - hl + r, a0: Math.PI },     // bas-gauche
      { cx: cx + hw - r, cy: cy - hl + r, a0: 3 * Math.PI / 2 }, // bas-droite
    ];

    for (const corner of corners) {
      for (let s = 0; s <= segments; s++) {
        const a = corner.a0 + (s / segments) * (Math.PI / 2);
        pts.push([corner.cx + r * Math.cos(a), corner.cy + r * Math.sin(a)]);
      }
    }

    const n = pts.length;
    const z0 = 0, z1 = h;

    // Face dessous
    for (let i = 1; i < n - 1; i++) {
      this.addTriangle([pts[0][0], pts[0][1], z0], [pts[i + 1][0], pts[i + 1][1], z0], [pts[i][0], pts[i][1], z0]);
    }
    // Face dessus
    for (let i = 1; i < n - 1; i++) {
      this.addTriangle([pts[0][0], pts[0][1], z1], [pts[i][0], pts[i][1], z1], [pts[i + 1][0], pts[i + 1][1], z1]);
    }
    // Faces latérales
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      this.addTriangle([pts[i][0], pts[i][1], z0], [pts[j][0], pts[j][1], z0], [pts[j][0], pts[j][1], z1]);
      this.addTriangle([pts[i][0], pts[i][1], z0], [pts[j][0], pts[j][1], z1], [pts[i][0], pts[i][1], z1]);
    }
  }

  toBinary() {
    const numTriangles = this.triangles.length;
    const bufSize = 80 + 4 + numTriangles * 50;
    const buf = Buffer.alloc(bufSize);

    // Header (80 bytes)
    buf.write("EKKO QR STL - generated by qr-stl.mjs", 0, 80, "ascii");
    // Nombre de triangles
    buf.writeUInt32LE(numTriangles, 80);

    let offset = 84;
    for (const tri of this.triangles) {
      // Normal
      buf.writeFloatLE(tri.n[0], offset); offset += 4;
      buf.writeFloatLE(tri.n[1], offset); offset += 4;
      buf.writeFloatLE(tri.n[2], offset); offset += 4;
      // Vertex 1
      buf.writeFloatLE(tri.v1[0], offset); offset += 4;
      buf.writeFloatLE(tri.v1[1], offset); offset += 4;
      buf.writeFloatLE(tri.v1[2], offset); offset += 4;
      // Vertex 2
      buf.writeFloatLE(tri.v2[0], offset); offset += 4;
      buf.writeFloatLE(tri.v2[1], offset); offset += 4;
      buf.writeFloatLE(tri.v2[2], offset); offset += 4;
      // Vertex 3
      buf.writeFloatLE(tri.v3[0], offset); offset += 4;
      buf.writeFloatLE(tri.v3[1], offset); offset += 4;
      buf.writeFloatLE(tri.v3[2], offset); offset += 4;
      // Attribute byte count
      buf.writeUInt16LE(0, offset); offset += 2;
    }
    return buf;
  }
}

// ─── Construction du mesh ───────────────────────────────────────────────
const stl = new STLWriter();

// 1. Plaque de base (centrée à l'origine en X, Y part de 0)
const plateCX = PLATE_W / 2;
const plateCY = PLATE_L / 2;
stl.addRoundedPlate(plateCX, plateCY, PLATE_W, PLATE_L, PLATE_H, CORNER_R, CORNER_SEG);

// 2. Modules QR — NÉGATIF (creux depuis le dessus)
// On creuse les modules noirs : un trou de ENGRAVE_DEPTH partant du sommet
const engraveTop = PLATE_H;           // surface du dessus
const engraveBottom = PLATE_H - ENGRAVE_DEPTH; // fond du creux
for (let row = 0; row < moduleCount; row++) {
  for (let col = 0; col < moduleCount; col++) {
    if (modules.get(col, row)) {
      const mx = qrOffsetX + col * moduleSize;
      const my = qrOffsetY + row * moduleSize;
      stl.addHole(mx, my, engraveBottom, moduleSize, moduleSize, ENGRAVE_DEPTH);
    }
  }
}

// 3. Texte EKKO sous le QR code — glyphes vectoriels extrudés
const textWord = "EKKO";
const charHeightMM = 4;    // hauteur des caractères en mm
const charGapMM = 0.8;     // espace entre lettres en mm

// Calcul largeur totale du mot
let totalTextW = 0;
for (const ch of textWord) {
  totalTextW += (GLYPH_ADVANCE[ch] ?? 0.6) * charHeightMM;
}
totalTextW += (textWord.length - 1) * charGapMM;

const textStartX = (PLATE_W - totalTextW) / 2;
const textStartY = qrOffsetY + QR_SIZE + 3; // 3mm sous le QR

// Fonction : extrude un polygone 2D en creux (normales inversées)
function extrudeHolePolygon(pts2d, xOff, yOff, z0, height) {
  const z1 = z0 + height;
  const n = pts2d.length;
  const world = pts2d.map(([px, py]) => [px + xOff, py + yOff]);

  // Face dessous — normale vers +Z (inversée)
  for (let i = 1; i < n - 1; i++) {
    stl.addTriangle(
      [world[0][0], world[0][1], z0],
      [world[i][0], world[i][1], z0],
      [world[i + 1][0], world[i + 1][1], z0],
    );
  }
  // Face dessus — normale vers -Z (inversée)
  for (let i = 1; i < n - 1; i++) {
    stl.addTriangle(
      [world[0][0], world[0][1], z1],
      [world[i + 1][0], world[i + 1][1], z1],
      [world[i][0], world[i][1], z1],
    );
  }
  // Faces latérales — normales inversées
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    stl.addTriangle(
      [world[i][0], world[i][1], z0],
      [world[j][0], world[j][1], z1],
      [world[j][0], world[j][1], z0],
    );
    stl.addTriangle(
      [world[i][0], world[i][1], z0],
      [world[i][0], world[i][1], z1],
      [world[j][0], world[j][1], z1],
    );
  }
}

let cursorX = textStartX;
for (const ch of textWord) {
  const glyphPolys = GLYPHS[ch];
  const advance = (GLYPH_ADVANCE[ch] ?? 0.6) * charHeightMM;
  if (glyphPolys) {
    for (const poly of glyphPolys) {
      // Mise à l'échelle : unité 1 → charHeightMM
      const scaled = poly.map(([px, py]) => [px * charHeightMM, py * charHeightMM]);
      extrudeHolePolygon(scaled, cursorX, textStartY, engraveBottom, ENGRAVE_DEPTH);
    }
  }
  cursorX += advance + charGapMM;
}

// ─── Export ─────────────────────────────────────────────────────────────
mkdirSync(OUTPUT_DIR, { recursive: true });
const filename = `ekko-qr-${echoId.slice(0, 8)}.stl`;
const filepath = join(OUTPUT_DIR, filename);
writeFileSync(filepath, stl.toBinary());

console.log(`✅ STL généré : ${filepath}`);
console.log(`   Plaque : ${PLATE_W}×${PLATE_L}×${PLATE_H} mm (bords arrondis r=${CORNER_R}mm)`);
console.log(`   QR     : ${QR_SIZE}×${QR_SIZE}mm, gravure en creux ${ENGRAVE_DEPTH}mm`);
console.log(`   EKKO   : centré sous QR, creux ${ENGRAVE_DEPTH}mm, traits épais`);
console.log(`   URL    : ${url}`);
console.log(`   Triangles : ${stl.triangles.length}`);
console.log(`\n💡 Mode négatif :`);
console.log(`   - Plaque pleine de ${PLATE_H}mm`);
console.log(`   - QR + EKKO gravés en creux (${ENGRAVE_DEPTH}mm de profondeur depuis le dessus)`);
console.log(`   - Fond des creux à Z=${PLATE_H - ENGRAVE_DEPTH}mm`);
console.log(`   → Pour bicolore : remplir les creux d'encre/résine noire`);
