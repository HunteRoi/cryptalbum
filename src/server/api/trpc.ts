import {
	createTRPCStoreLimiter,
	defaultFingerPrint,
} from "@trpc-limiter/memory";
import { TRPCError, initTRPC } from "@trpc/server";
import { Client as MinioClient } from "minio";
import type { NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { env } from "@cryptalbum/env";
import { getServerAuthSession } from "@cryptalbum/server/auth";
import { db } from "@cryptalbum/server/db";
import { unconfiguredLogger } from "@cryptalbum/server/logger";

export const createTRPCContext = async (opts: {
	req: NextRequest;
	headers: Headers;
}) => {
	const session = await getServerAuthSession();
	const logWrapper = unconfiguredLogger.enrichWithAction("UNKNOWN");

	if (session) {
		logWrapper.enrichWithUserId(session.user.userId);
	}

	return {
		logWrapper,
		db,
		session,
		...opts,
	};
};

const ratelimiter = createTRPCStoreLimiter<typeof t>({
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	fingerprint: (ctx) => defaultFingerPrint(ctx.req),
	windowMs: 20000,
	message: (retryAfter) =>
		`Too many requests, please try again later. ${retryAfter}`,
	max: 30,
	onLimit: (retryAfter, _ctx, fingerprint) => {
		_ctx.logWrapper.create().warn(`Rate limit exceeded for ${fingerprint}`);
		throw new TRPCError({
			code: "TOO_MANY_REQUESTS",
			message: `Too many requests from ${fingerprint}`,
		});
	},
});

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	},
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

export const ratelimitedProcedure = t.procedure.use(ratelimiter);
export const publicProcedure = ratelimitedProcedure;
export const protectedProcedure = ratelimitedProcedure.use(
	async ({ ctx, next }) => {
		const defaultLogger = ctx.logWrapper.create();

		if (!ctx.session?.user || !ctx.session?.user.id) {
			defaultLogger.error("Unauthorized request to protected procedure");
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		defaultLogger.verbose("Load Protected Procedure");

		const userDevice = await ctx.db.userDevice.findUnique({
			where: { id: ctx.session.user.id },
		});

		if (!userDevice) {
			defaultLogger.error("No user device found");
			throw new TRPCError({ code: "BAD_REQUEST" });
		}
		if (!userDevice.symmetricalKey) {
			defaultLogger.error(
				"Request from untrusted device {deviceId}",
				userDevice.id,
			);
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		const minioClient = new MinioClient({
			endPoint: env.MINIO_ENDPOINT,
			port: env.MINIO_PORT,
			useSSL: false,
			accessKey: env.MINIO_ACCESS_KEY,
			secretKey: env.MINIO_SECRET_KEY,
			region: env.MINIO_REGION,
		});

		return next({
			ctx: {
				// infers the `session` as non-nullable
				session: {
					...ctx.session,
					userId: ctx.session.user.userId,
				},
				minio: minioClient,
				// provides a logger with the current user
				defaultLogger,
			},
		});
	},
);
