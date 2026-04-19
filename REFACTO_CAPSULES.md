# Refacto flow capsules (paiement async + polling Firestore)

## Vue d'ensemble

Avant : paiement Stripe → retour `/theme/{theme}?payment=success&...` → fusion ffmpeg synchrone → écran de dévoilement. Si la fusion plantait, l'utilisateur revenait à l'import et croyait son paiement perdu.

Après : paiement Stripe → webhook marque la capsule `paid` → fusion asynchrone → page `/capsule/{id}` qui poll le statut Firestore → affiche processing → ready (cadenas+QR) ou failed (retry possible).

## Flow détaillé

1. **Upload audios** (inchangé) : client → `uploadAudiosToStorage()` → `temp/{uploadId}/`
2. **Création session Stripe** (`/api/stripe/checkout`) :
   - crée une capsule Firestore `capsules/{id}` en statut `pending`
   - passe `capsuleId` en `metadata` Stripe
   - `success_url = /capsule/{id}?session_id={CHECKOUT_SESSION_ID}`
3. **Paiement utilisateur** → retour sur `/capsule/{id}`
4. **Webhook Stripe** (`/api/stripe/webhook`) :
   - vérifie la signature
   - sur `checkout.session.completed` → `markCapsulePaid` → `fetch` non-bloquant vers `/api/capsules/{id}/process`
5. **Page `/capsule/{id}`** polle `/api/capsules/{id}` toutes les 2,5 s
   - si `sessionId` en URL et capsule `pending` après retour Stripe → appelle `/api/capsules/{id}/claim` en fallback (au cas où le webhook n'est pas encore arrivé ou pas configuré en dev)
   - affiche écran `processing` tant que `pending|paid|processing`
   - affiche `EchoRevealScreen` (cadenas + QR) dès `ready`
   - affiche écran `failed` avec bouton "réessayer" si erreur
6. **Processor** (`/api/capsules/{id}/process`) :
   - vérifie statut `paid` (sinon refuse, idempotent)
   - marque `processing`
   - ffmpeg concat → upload final → `markCapsuleReady`
   - sur erreur : `markCapsuleFailed(error)`

## Statuts Firestore

```
capsules/{id} = {
  status: "pending" | "paid" | "processing" | "ready" | "failed",
  uid, theme, accentColor, storageOption, uploadId,
  sessionId?, echoId?, audioUrl?, expiresAt?, error?,
  createdAt, paidAt?, processingAt?, readyAt?, failedAt?
}
```

## Variables d'environnement à ajouter

```env
# Variables déjà présentes (inchangées)
STRIPE_SECRET_KEY=...
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...

# NOUVEAU : signing secret du webhook Stripe
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# (optionnel mais recommandé) URL publique de l'app pour le trigger process depuis le webhook
NEXT_PUBLIC_BASE_URL=https://ekko-app.vercel.app
```

## Configurer le webhook Stripe

1. Dashboard Stripe → **Developers → Webhooks → Add endpoint**
2. **Endpoint URL** : `https://<votre-domaine>/api/stripe/webhook`
3. **Events à écouter** : `checkout.session.completed`
4. Copier le **Signing secret** (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`
5. Ajouter la même variable dans les settings Vercel (Production + Preview + Development)

## Fallback si webhook non configuré / pas arrivé

La page `/capsule/{id}` contient un mécanisme de secours : si l'utilisateur arrive avec `?session_id=xxx` et que la capsule est encore `pending`, elle appelle `/api/capsules/{id}/claim?session_id=xxx`. Ce endpoint vérifie la session Stripe côté API, puis déclenche le process. Le flow fonctionne donc même sans webhook configuré (utile en dev).

## Fichiers créés/modifiés

| Fichier | Rôle |
|---|---|
| `app/lib/firebaseAdmin.ts` | NOUVEAU — admin centralisé (App, Bucket, Firestore) |
| `app/lib/capsules.ts` | NOUVEAU — CRUD Firestore capsule + statuts |
| `app/api/stripe/checkout/route.ts` | MODIFIÉ — crée capsule Firestore, success_url vers `/capsule/{id}` |
| `app/api/stripe/webhook/route.ts` | NOUVEAU — webhook Stripe sécurisé par signature |
| `app/api/capsules/[id]/route.ts` | NOUVEAU — GET statut capsule (polling) |
| `app/api/capsules/[id]/process/route.ts` | NOUVEAU — fusion ffmpeg (remplace `/api/storage/merge`) |
| `app/api/capsules/[id]/claim/route.ts` | NOUVEAU — fallback : verify Stripe + trigger process |
| `app/capsule/[id]/page.tsx` | NOUVEAU — page UI avec poll + processing + reveal |
| `app/components/ThemePage.tsx` | MODIFIÉ — retire logique post-paiement, export `EchoRevealScreen` |
| `app/api/storage/merge/route.ts` | SUPPRIMÉ — remplacé par `/api/capsules/[id]/process` |

## Tests manuels à faire

- [ ] Paiement réussi → arrive sur `/capsule/{id}` → voit "Préparation" → cadenas+QR après ~5-20s
- [ ] Ouvrir `/capsule/{id}` déjà ready → affiche directement reveal
- [ ] Simuler échec fusion (uploadId invalide) → voit écran failed → bouton retry fonctionne
- [ ] Fermer la page pendant processing → revenir plus tard → capsule est ready (flow async indépendant)
- [ ] Webhook en dev : si non configuré, le claim fallback doit prendre le relais

## Limites Vercel (pour mémoire)

- `maxDuration: 60` est défini sur `/api/capsules/[id]/process` (la fusion peut prendre du temps)
- `ffmpeg-static` continue d'être utilisé ; si ça plante encore, voir les logs de `[capsule/process]` pour diagnostiquer (pas de `console.error` swallow, l'erreur est stockée dans `capsule.error`)
