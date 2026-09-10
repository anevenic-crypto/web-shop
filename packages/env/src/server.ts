import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		MINIO_ENDPOINT: z.string().min(1),
		MINIO_PORT: z.coerce.number().default(9000),
		MINIO_USE_SSL: z
			.enum(["true", "false"])
			.default("false")
			.transform((value) => value === "true"),
		MINIO_ACCESS_KEY: z.string().min(1),
		MINIO_SECRET_KEY: z.string().min(1),
		MINIO_BUCKET: z.string().min(1).default("product-images"),
		MINIO_PUBLIC_URL: z.url(),
		RESEND_API_KEY: z.string().min(1).optional(),
		ORDER_NOTIFICATION_EMAIL: z.email().optional(),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
