import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@cryptalbum/env";
import { z } from "zod";

export const deleteAlbum = protectedProcedure
	.input(z.string())
	.mutation(async ({ ctx, input: albumId }) => {
		const logger = ctx.logWrapper.enrichWithAction("DELETE_ALBUM").create();
		logger.info("Trying to delete album {albumId}", { albumId });

		const album = await ctx.db.album.findFirst({
			where: {
				id: albumId,
				userId: ctx.session.userId,
			},
            select: {
                id: true,
                pictures: {
                    select: {
                        id: true,
                    },
                },
            },
		});

		if (!album) {
			logger.error(
				"The album does not exist or the user does not have permission to access it.",
			);
			throw new TRPCError({
				code: "NOT_FOUND",
				message:
					"The album does not exist or you do not have permission to access it.",
			});
		}

		try {
			await ctx.db.album.delete({
				where: { id: album.id },
			});
            await ctx.minio.removeObjects(env.MINIO_BUCKET, album.pictures.map((picture) => picture.id));
		} catch (error) {
			logger.error("Failed to delete album {albumId}", { albumId });

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to delete the album.",
			});
		}
	});
