-- Pokreni jednom u Neon -> SQL Editor (dodaje mejl kupca i cenu dostave na porudzbine)
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS shipping_rsd integer NOT NULL DEFAULT 0;
