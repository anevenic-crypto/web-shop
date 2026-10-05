/**
 * Skida sve slike iz lokalnog MinIO-a (Docker) u apps/web/public/product-images/
 * da bi ih Vercel sluzio direktno sa sajta. Pokreni: scripts\preuzmi-slike.bat
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Client } from "minio";

const local = new Client({
	endPoint: "localhost", port: 9000, useSSL: false,
	accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
	secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
});
const bucket = "product-images";
const outDir = join("apps", "web", "public", "product-images");
let n = 0;
for await (const obj of local.listObjectsV2(bucket, "", true)) {
	const stream = await local.getObject(bucket, obj.name);
	const chunks = [];
	for await (const c of stream) chunks.push(c);
	const dest = join(outDir, obj.name);
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, Buffer.concat(chunks));
	n++;
	console.log("preuzeto:", obj.name);
}
console.log(`\nGotovo: ${n} slika u ${outDir}`);
