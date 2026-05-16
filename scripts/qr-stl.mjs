#!/usr/bin/env node
/**
 * Génère un QR code en STL pour impression 3D bicolore.
 *
 * Résultat :
 *   - Plaque de base : 30mm × 50mm × 1mm, bords arrondis (blanc à l'impression)
 *   - Modules QR : zone 25mm × 25mm centrée, épaisseur 8mm au-dessus de la plaque (noir)
 *   - Texte "EKKO" centré sous le QR code, même épaisseur 8mm (noir)
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
const PLATE_W = 30;        // largeur plaque
const PLATE_L = 50;        // longueur plaque
const PLATE_H = 1;         // épaisseur plaque
const CORNER_R = 2;        // rayon bords arrondis
const CORNER_SEG = 8;      // segments par quart de cercle

const QR_SIZE = 25;        // côté zone QR
const QR_H = 8;            // hauteur des modules au-dessus de la plaque

const BASE_URL = "https://www.vosekko.com/v/";

// ─── Police pixel 5×7 pour EKKO ────────────────────────────────────────
const FONT = {
  E: [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  K: [
    [1,0,0,0,1],
    [1,0,0,1,0],
    [1,0,1,0,0],
    [1,1,0,0,0],
    [1,0,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1],
  ],
  O: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
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

// 2. Modules QR
for (let row = 0; row < moduleCount; row++) {
  for (let col = 0; col < moduleCount; col++) {
    if (modules.get(col, row)) {
      const mx = qrOffsetX + col * moduleSize;
      const my = qrOffsetY + row * moduleSize;
      stl.addBox(mx, my, PLATE_H, moduleSize, moduleSize, QR_H);
    }
  }
}

// 3. Texte EKKO sous le QR code
const textWord = "EKKO";
const charW = 5; // pixels par caractère
const charH = 7;
const charGap = 1; // espace entre caractères
const totalPixelsW = textWord.length * charW + (textWord.length - 1) * charGap;

// Taille d'un pixel de texte (viser ~18mm de large pour le mot)
const textTotalW = 18;
const pixelSize = textTotalW / totalPixelsW;
const textStartX = (PLATE_W - textTotalW) / 2;
const textStartY = qrOffsetY + QR_SIZE + 3; // 3mm sous le QR

for (let ci = 0; ci < textWord.length; ci++) {
  const charData = FONT[textWord[ci]];
  if (!charData) continue;
  const charOffX = ci * (charW + charGap) * pixelSize;

  for (let row = 0; row < charH; row++) {
    for (let col = 0; col < charW; col++) {
      if (charData[row][col]) {
        const px = textStartX + charOffX + col * pixelSize;
        const py = textStartY + row * pixelSize;
        stl.addBox(px, py, PLATE_H, pixelSize, pixelSize, QR_H);
      }
    }
  }
}

// ─── Export ─────────────────────────────────────────────────────────────
mkdirSync(OUTPUT_DIR, { recursive: true });
const filename = `ekko-qr-${echoId.slice(0, 8)}.stl`;
const filepath = join(OUTPUT_DIR, filename);
writeFileSync(filepath, stl.toBinary());

console.log(`✅ STL généré : ${filepath}`);
console.log(`   Plaque : ${PLATE_W}×${PLATE_L}×${PLATE_H} mm (bords arrondis r=${CORNER_R}mm)`);
console.log(`   QR     : ${QR_SIZE}×${QR_SIZE}mm, hauteur ${QR_H}mm`);
console.log(`   EKKO   : centré sous QR, hauteur ${QR_H}mm`);
console.log(`   URL    : ${url}`);
console.log(`   Triangles : ${stl.triangles.length}`);
console.log(`\n💡 Impression bicolore :`);
console.log(`   - Plaque = filament blanc (couches 0–1mm)`);
console.log(`   - QR + EKKO = filament noir (couches 1–9mm)`);
console.log(`   → Utiliser un changement de couleur à Z=1mm dans votre slicer`);
