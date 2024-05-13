import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z
			.string()
			.url()
			.refine(
				(str) =>
					!str.includes(
						"postgresql://postgres:password@localhost:5432/cryptalbum",
					),
				"You forgot to change the default URL",
			),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		NEXTAUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string()
				: z.string().optional(),
		NEXTAUTH_URL: z.preprocess(
			// This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
			// Since NextAuth.js automatically uses the VERCEL_URL if present.
			(str) => process.env.VERCEL_URL ?? str,
			// VERCEL_URL doesn't include `https` so it cant be validated as a URL
			process.env.VERCEL ? z.string() : z.string().url(),
		),
		MAX_FILE_SIZE_MB: z.number().default(50),
		MINIO_ACCESS_KEY: z.string().min(1),
		MINIO_SECRET_KEY: z.string().min(1),
		MINIO_ENDPOINT: z.string(),
		MINIO_PORT: z.number().default(9000),
		MINIO_BUCKET: z.string().default("cryptalbum"),
		MINIO_REGION: z.string().default("eu-west-1"),
		MINIO_SECURE: z.boolean().default(false),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		NEXT_PUBLIC_MAX_FILE_SIZE_MB: z.number().default(50),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		MAX_FILE_SIZE_MB: Number.parseInt(process.env.MAX_FILE_SIZE_MB ?? "50", 10),
		NEXT_PUBLIC_MAX_FILE_SIZE_MB: Number.parseInt(
			process.env.MAX_FILE_SIZE_MB ?? "50",
			10,
		),
		MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
		MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
		MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
		MINIO_PORT: Number.parseInt(process.env.MINIO_PORT ?? "9000", 10),
		MINIO_BUCKET: process.env.MINIO_BUCKET,
		MINIO_REGION: process.env.MINIO_REGION,
		MINIO_SECURE: Boolean(process.env.MINIO_SECURE),
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
