import "dotenv/config";
import { env } from "@web-shop/env/server";
import { Client } from "minio";

export const PRODUCT_IMAGES_BUCKET = env.MINIO_BUCKET;

export const minioClient = new Client({
	endPoint: env.MINIO_ENDPOINT,
	port: env.MINIO_PORT,
	useSSL: env.MINIO_USE_SSL,
	accessKey: env.MINIO_ACCESS_KEY,
	secretKey: env.MINIO_SECRET_KEY,
});

export function getPublicUrl(key: string) {
	return `${env.MINIO_PUBLIC_URL}/${PRODUCT_IMAGES_BUCKET}/${key}`;
}

let ensured: Promise<void> | null = null;

function ensureBucket() {
	if (!ensured) {
		ensured = (async () => {
			const exists = await minioClient
				.bucketExists(PRODUCT_IMAGES_BUCKET)
				.catch(() => false);
			if (!exists) {
				await minioClient.makeBucket(PRODUCT_IMAGES_BUCKET);
			}
			const policy = {
				Version: "2012-10-17",
				Statement: [
					{
						Effect: "Allow",
						Principal: { AWS: ["*"] },
						Action: ["s3:GetObject"],
						Resource: [`arn:aws:s3:::${PRODUCT_IMAGES_BUCKET}/*`],
					},
				],
			};
			await minioClient.setBucketPolicy(
				PRODUCT_IMAGES_BUCKET,
				JSON.stringify(policy),
			);
		})().catch((error) => {
			ensured = null;
			throw error;
		});
	}
	return ensured;
}

export async function putObject(
	key: string,
	buffer: Buffer,
	contentType: string,
) {
	await ensureBucket();
	await minioClient.putObject(
		PRODUCT_IMAGES_BUCKET,
		key,
		buffer,
		buffer.length,
		{
			"Content-Type": contentType,
		},
	);
	return getPublicUrl(key);
}

export async function removeObject(key: string) {
	await minioClient.removeObject(PRODUCT_IMAGES_BUCKET, key).catch(() => {});
}
