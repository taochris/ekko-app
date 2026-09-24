import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const routePath = fileURLToPath(new URL("../app/api/stripe/checkout/route.ts", import.meta.url));
const source = readFileSync(routePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;

async function checkout(product, nfcEnabled) {
  let capsule;
  let session;
  const exports = {};
  class StripeMock {
    checkout = { sessions: { create: async (data) => {
      session = data;
      return { url: "https://checkout.stripe.test/session", id: "cs_test" };
    } } };
  }
  const sandbox = {
    exports,
    process: { env: { STRIPE_SECRET_KEY: "sk_test_fake", NEXT_PUBLIC_BASE_URL: "http://localhost:3001" } },
    console,
    require: (id) => {
      if (id === "next/server") return { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } };
      if (id === "stripe") return StripeMock;
      if (id === "../../../lib/capsules") return { createCapsule: async (data) => { capsule = data; return "capsule-test"; } };
      throw new Error(`Unexpected import: ${id}`);
    },
  };
  vm.runInNewContext(compiled, sandbox, { filename: routePath });
  const response = await exports.POST({
    json: async () => ({ product, nfcEnabled, theme: "amour", uid: "client-test", format: "carre", engraveName: "Léa", email: "test@example.com" }),
    headers: { get: () => "http://localhost:3001" },
  });
  assert.equal(response.status, 200);
  return { capsule, session };
}

test("QR seul coûte 24,90 € et ne demande aucune puce NFC", async () => {
  const { capsule, session } = await checkout("porteClef", false);
  assert.equal(session.line_items[0].price_data.unit_amount, 2490);
  assert.equal(session.metadata.nfcEnabled, "false");
  assert.equal(capsule.nfcEnabled, false);
  assert.doesNotMatch(session.line_items[0].price_data.product_data.description, /Puce NFC/);
});

test("QR + NFC coûte 27,90 € et transmet l'option à la fabrication", async () => {
  const { capsule, session } = await checkout("porteClef", true);
  assert.equal(session.line_items[0].price_data.unit_amount, 2790);
  assert.equal(session.metadata.nfcEnabled, "true");
  assert.equal(capsule.nfcEnabled, true);
  assert.match(session.line_items[0].price_data.product_data.description, /Puce NFC autocollante au dos/);
});

test("un paramètre NFC falsifié n'active pas le supplément", async () => {
  const { capsule, session } = await checkout("porteClef", "true");
  assert.equal(session.line_items[0].price_data.unit_amount, 2490);
  assert.equal(capsule.nfcEnabled, false);
});

test("le produit numérique conserve son tarif et ne contient pas de NFC", async () => {
  const { capsule, session } = await checkout("numerique", true);
  assert.equal(session.line_items[0].price_data.unit_amount, 999);
  assert.equal(session.metadata.nfcEnabled, undefined);
  assert.equal(capsule.nfcEnabled, undefined);
});

test("les récapitulatifs client et fabricant distinguent QR seul et QR + NFC", () => {
  const emailPath = fileURLToPath(new URL("../app/lib/order-emails.ts", import.meta.url));
  const emailSource = readFileSync(emailPath, "utf8");
  const emailCompiled = ts.transpileModule(emailSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const emailExports = {};
  vm.runInNewContext(emailCompiled, {
    exports: emailExports,
    require: (id) => (["resend", "qrcode", "opentype.js"].includes(id) ? {} : require(id)),
  });

  const base = { capsuleId: "capsule-test", engraveName: "Léa", format: "carre", shippingName: "Cliente" };
  const admin = { ...base, qrUrl: "https://example.com/capsule-test", shippingAddress: "", customerPhone: "", customerEmail: "test@example.com", amount: 2790 };
  assert.match(emailExports.buildKeychainEmail({ ...base, nfcEnabled: false }), /QR code gravé · 24,90 €/);
  assert.match(emailExports.buildKeychainEmail({ ...base, nfcEnabled: true }), /QR code \+ puce NFC au dos · 27,90 €/);
  assert.match(emailExports.buildAdminOrderEmail({ ...admin, nfcEnabled: true }), /QR code \+ puce NFC autocollante au dos/);
  assert.match(emailExports.buildAdminOrderEmail({ ...admin, nfcEnabled: false }), /QR code seul \(sans NFC\)/);
});
