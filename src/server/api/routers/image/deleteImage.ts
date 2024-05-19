import { env } from "@cryptalbum/env";
import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const deleteImage = protectedProcedure
	.input(z.string())
	.mutation(async ({ ctx, input: imageId }) => {
		const logger = ctx.logWrapper.enrichWithAction("DELETE_IMAGE").create();

		const image = await ctx.db.picture.findFirst({
			where: {
				id: imageId,
				userId: ctx.session.userId,
			},
		});

		if (image?.albumId) {
			logger.info(
				"Trying to delete image {imageId} from album {albumId}",
				imageId,
				image.albumId,
			);
		} else {
			logger.info("Trying to delete image {imageId}", imageId);
		}

		if (!image) {
			logger.error(
				"The image does not exist or the user does not have permission to access it.",
			);
			throw new TRPCError({
				code: "NOT_FOUND",
				message:
					"The image does not exist or you do not have permission to access it.",
			});
		}

		try {
			await ctx.db.$transaction(async (db) => {
				await db.picture.delete({
					where: { id: image.id },
				});
				await ctx.minio.removeObject(env.MINIO_BUCKET, image.id);
			});
		} catch (error) {
			logger.error("Failed to delete image {imageId}", imageId);

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to delete the image.",
			});
		}
	});
