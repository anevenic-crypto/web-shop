# Deploy Vellure na internet

Tri besplatna servisa, redom: **Neon** (baza) → **Cloudflare R2** (slike) → **Render** (AI bot) → **Vercel** (shop).
Za sve se registruješ GitHub nalogom. Ukupno ~45 minuta prvi put.

> Pre svega: oba projekta (`web-shop` i `ai-chat`) moraju biti na GitHubu — Render i Vercel se kače na repo.

---

## 1. Neon — baza (10 min)

1. https://neon.tech → Sign up with GitHub → **Create project** (ime: `vellure`, region: Frankfurt).
2. Na dashboardu klikni **Connect** → kopiraj **Connection string** (počinje `postgresql://...neon.tech/neondb?sslmode=require`). To je tvoj novi `DATABASE_URL`.
3. Prebaci podatke iz lokalne baze (dok Docker radi):
   - dvaput klikni `scripts\export-db.bat` → napravi `scripts\dump.sql`
   - dvaput klikni `scripts\import-db-to-neon.bat` → nalepi Neon connection string → Enter
4. Provera: na Neon-u otvori **Tables** — treba da vidiš `product`, `category`, `order`, `chat_conversation`…

---

## 2. Cloudflare R2 — slike proizvoda (10 min)

1. https://dash.cloudflare.com → Sign up → levi meni **R2 Object Storage** → **Create bucket** → ime `product-images`, lokacija Automatic.
2. U bucketu → **Settings** → **Public access** → **R2.dev subdomain** → **Allow** → kopiraj URL (`https://pub-xxxx.r2.dev`). To je `MINIO_PUBLIC_URL`.
3. Nazad na R2 početnu → **Manage R2 API Tokens** → **Create API token** → Permissions: *Object Read & Write* → **Create**. Kopiraj **Access Key ID** i **Secret Access Key** (vide se samo jednom!). Na istoj strani je i **Account ID**.
4. Prebaci postojeće slike: napravi fajl `scripts\.env.r2` sa sadržajem:
   ```
   R2_ACCOUNT_ID=<Account ID>
   R2_ACCESS_KEY=<Access Key ID>
   R2_SECRET_KEY=<Secret Access Key>
   R2_BUCKET=product-images
   R2_PUBLIC_URL=https://pub-xxxx.r2.dev
   ```
   pa u terminalu (web-shop folder, dok lokalni Docker radi): `node scripts/copy-images-to-r2.mjs`
5. Skripta na kraju ispiše 2 SQL komande — nalepi ih u Neon → **SQL Editor** → Run. Time slike u bazi pokazuju na R2.

---

## 3. Render — AI bot (10 min)

1. https://render.com → Sign up with GitHub → **New +** → **Blueprint** → izaberi repo `ai-chat` → **Apply**.
   (Render pročita `render.yaml` iz repoa i sam podesi Docker.)
2. Kad pita za promenljive, upiši:
   - `OPENAI_API_KEY` — tvoj ključ
   - `DATABASE_URL` — Neon connection string
   - `SHOP_URL` — za sad `https://placeholder.vercel.app` (promenićeš posle koraka 4)
   - `BOT_ADMIN_TOKEN` — Render ga sam generiše; **kopiraj ga**, treba ti za Vercel
3. Sačekaj deploy (2–3 min). Dobijaš adresu tipa `https://vellure-ai-bot.onrender.com`.
4. Provera: otvori `https://vellure-ai-bot.onrender.com/api/health` → `"proizvoda_u_katalogu"` > 0.

> Besplatni Render "zaspi" posle 15 min neaktivnosti; prvi odgovor bota posle pauze traje ~30 s. Za portfolio je OK; ako smeta, Starter plan je 7 $/mesec.

---

## 4. Vercel — shop (10 min)

1. https://vercel.com → Sign up with GitHub → **Add New** → **Project** → Import `web-shop`.
2. **Root Directory** → Edit → izaberi `apps/web`. Framework: Next.js (sam prepozna).
3. **Environment Variables** — otvori `apps/web/.env.production.example` i upiši svaku promenljivu:
   - `DATABASE_URL` — Neon
   - `BETTER_AUTH_SECRET` — bilo kojih 32+ nasumičnih karaktera (možeš iskoristiti onaj iz lokalnog `.env`)
   - `BETTER_AUTH_URL` — za sad `https://web-shop.vercel.app` (ispravi posle prvog deploya na pravu adresu)
   - `MINIO_*` — R2 podaci iz koraka 2 (vidi primer), **`MINIO_PUBLIC_URL_HAS_BUCKET=true`**
   - `NEXT_PUBLIC_CHAT_API_URL` i `CHAT_API_URL` — Render adresa bota
   - `BOT_ADMIN_TOKEN` — token sa Rendera
4. **Deploy**. Kad završi, dobijaš adresu npr. `https://web-shop-xyz.vercel.app`.
5. Vrati se u **Settings → Environment Variables** i ispravi `BETTER_AUTH_URL` na tu pravu adresu → **Redeploy**.
6. Na Renderu ispravi `SHOP_URL` na istu adresu (da bot dozvoli pozive iz shopa) → Render sam redeploy-uje.

---

## 5. Provera

- Otvori shop → proizvodi i slike se vide.
- Klikni chat dole desno → bot odgovara i preporučuje proizvode.
- Uloguj se kao admin → **AI razgovori** radi.

## Ubuduće

Svaki `git push` na GitHub automatski redeploy-uje i shop (Vercel) i bota (Render). Lokalno i dalje radiš kao do sad — lokalni `.env` fajlovi pokazuju na lokalnu bazu i MinIO, produkcija na Neon i R2.

## Ako nešto zapne

- **Vercel build pada** → Deployments → klikni na neuspeli → Build Logs; pošalji mi tekst greške.
- **Slike se ne vide** → proveri da je R2 bucket javan (korak 2.2) i da je `MINIO_PUBLIC_URL_HAS_BUCKET=true`.
- **Bot kaže "ne mogu da odgovorim"** → na Renderu proveri `SHOP_URL` (mora biti tačna Vercel adresa, bez `/` na kraju).
- **Login ne radi** → `BETTER_AUTH_URL` mora biti tačna Vercel adresa.
