/**
 * Kopira sve slike iz lokalnog MinIO-a u Cloudflare R2 i ispisuje SQL kojim se
 * ažuriraju URL-ovi slika u bazi.
 *
 * Pokretanje (iz web-shop foldera, dok lokalni MinIO radi):
 *   node scripts/copy-images-to-r2.mjs
 *
 * Potrebne promenljive (možeš ih staviti u scripts/.env.r2 ili upisati ispod):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET (npr. product-images), R2_PUBLIC_URL (https://pub-xxx.r2.dev)
 */
import { readFileSync, existsSync } from "node:fs";
import { Client } from "minio";

if (existsSync("scripts/.env.r2")) {
	for (const line of readFileSync("scripts/.env.r2", "utf8").split("\n")) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
		if (m) process.env[m[1]] ??= m[2];
	}
}
const need = (k) => {
	if (!process.env[k]) throw new Error(`Nedostaje ${k}`);
	return process.env[k];
};

const local = new Client({
	endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
	port: Number(process.env.MINIO_PORT ?? 9000),
	useSSL: false,
	accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
	secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
});
const r2 = new Client({
	endPoint: `${need("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
	port: 443,
	useSSL: true,
	accessKey: need("R2_ACCESS_KEY"),
	secretKey: need("R2_SECRET_KEY"),
	region: "auto",
});
const localBucket = process.env.MINIO_BUCKET ?? "product-images";
const r2Bucket = need("R2_BUCKET");
const publicUrl = need("R2_PUBLIC_URL").replace(/\/$/, "");

let n = 0;
for await (const obj of local.listObjectsV2(localBucket, "", true)) {
	const stream = await local.getObject(localBucket, obj.name);
	const stat = await local.statObject(localBucket, obj.name);
	await r2.putObject(r2Bucket, obj.name, stream, stat.size, {
		"Content-Type": stat.metaData["content-type"] ?? "application/octet-stream",
	});
	n++;
	console.log("kopirano:", obj.name);
}
console.log(`\nGotovo: ${n} slika. Sad u Neon bazi pokreni ovaj SQL (Neon -> SQL Editor):\n`);
console.log(`UPDATE product_image SET url = '${publicUrl}/' || key;`);
console.log(`UPDATE promo SET image_url = '${publicUrl}/' || image_key WHERE image_key IS NOT NULL;`);
