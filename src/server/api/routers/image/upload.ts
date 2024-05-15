import { env } from "@cryptalbum/env";
import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const upload = protectedProcedure
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
		const logger = ctx.logWrapper.enrichWithAction("UPLOAD_IMAGE").create();

		try {
			logger.info("Uploading new image");

			await ctx.db.$transaction(async (database) => {
				const { id } = await database.picture.create({
					data: {
						userId: ctx.session.userId,
						name: payload.imageName,
						metadata,
						shareds: {
							create: {
								key: payload.symmetricalKey,
								userId: ctx.session.userId,
							},
						},
					},
				});

				const bucketExists = await ctx.minio.bucketExists(env.MINIO_BUCKET);
				if (!bucketExists) {
					await ctx.minio.makeBucket(env.MINIO_BUCKET, env.MINIO_REGION);
				}
				await ctx.minio.putObject(env.MINIO_BUCKET, id, payload.image);

				logger.info("Image uploaded with {id}", id);
			});
		} catch (error) {
			logger.error("Failed to upload image with error: {error}", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to upload image",
			});
		}
	});
