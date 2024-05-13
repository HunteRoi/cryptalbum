import {
	createTRPCRouter,
	protectedProcedure,
} from "@cryptalbum/server/api/trpc";

import { env } from "@cryptalbum/env";
import { TRPCError } from "@trpc/server";
import { Client as MinioClient } from "minio";
import { z } from "zod";

export const imageRouter = createTRPCRouter({
	upload: protectedProcedure
		.input(
			z.object({
				payload: z.object({
					image: z.string(),
					imageName: z.string(),
					requestDate: z.date(),
					symmetricalKey: z.string(),
				}),
				metadata: z.object({
					requestSize: z.number().gt(0),
				}),
			}),
		)
		.mutation(async ({ ctx, input: { payload, metadata } }) => {
			try {
				console.info(`Uploading image for user ${ctx.session.userId}`);

				await ctx.db.$transaction(async (database) => {
					const { id } = await database.picture.create({
						data: {
							userId: ctx.session.userId,
							metadata,
							shareds: {
								create: {
									key: payload.symmetricalKey,
									userId: ctx.session.userId,
								},
							},
						},
					});
					
					const minioClient = new MinioClient({
						endPoint: env.MINIO_ENDPOINT,
						port: env.MINIO_PORT,
						useSSL: false,
						accessKey: env.MINIO_ACCESS_KEY,
						secretKey: env.MINIO_SECRET_KEY,
						region: env.MINIO_REGION,
					});
					
					const bucketExists = await minioClient.bucketExists(env.MINIO_BUCKET);
					if (!bucketExists) {
						await minioClient.makeBucket(env.MINIO_BUCKET, env.MINIO_REGION);
					}
					await minioClient.putObject(env.MINIO_BUCKET, id, payload.image);
				});
			} catch (error) {
				console.error(
					`Failed to upload image for user ${
						ctx.session.userId
					} with error: ${JSON.stringify(error)}`,
				);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to upload image",
				});
			}
		}),
});
