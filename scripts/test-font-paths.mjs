import opentype from "opentype.js";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const FONT_FILES = {
  "Georgia, serif":            "Georgia-Regular.ttf",
  "'Cinzel', serif":           "Cinzel-Regular.woff",
  "'Dancing Script', cursive": "DancingScript-Bold.woff",
  "'Bebas Neue', sans-serif":  "BebasNeue-Regular.ttf",
  "'Pacifico', cursive":       "Pacifico-Regular.ttf",
};

mkdirSync(join(root, "qr-output"), { recursive: true });

for (const [fontKey, filename] of Object.entries(FONT_FILES)) {
  const buf = readFileSync(join(root, "public", "fonts", filename));
  const font = opentype.parse(buf.buffer);
  const label = "ARRONDI";
  const fontSize = 3.5;
  const textWidth = font.getAdvanceWidth(label, fontSize);
  const startX = (31.8 - textWidth) / 2;
  const glyphPath = font.getPath(label, startX, 38.5, fontSize);
  const pathSvg = glyphPath.toSVG(4);
  const svgOut = `<svg xmlns="http://www.w3.org/2000/svg" width="31.8mm" height="10mm" viewBox="0 5 31.8 10"><g fill="#000000">${pathSvg}</g></svg>`;
  const outFile = join(root, "qr-output", `test-${filename.replace(/\..+$/, "")}.svg`);
  writeFileSync(outFile, svgOut);
  console.log(`✅ ${fontKey} → ${outFile.split("\\").pop()} (path length: ${pathSvg.length})`);
}
