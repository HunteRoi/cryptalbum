import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const updateAlbum = protectedProcedure
	.input(
		z.object({
			albumId: z.string(),
			newName: z.string().optional(),
			newDescription: z.string().optional(),
		}),
	)
	.mutation(
		async ({ ctx, input: { albumId: id, newName, newDescription } }) => {
			const logger = ctx.logWrapper.enrichWithAction("UPDATE_ALBUM").create();

			if (!newName && !newDescription) {
				logger.error("No new name or description provided");
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You must provide a new name or description",
				});
			}

			logger.info("Updating album {albumId} with new name and/or description", {
				albumId: id,
			});

			const album = await ctx.db.album.findUnique({
				where: {
					id,
				},
			});

			if (!album) {
				logger.error("Album {albumId} not found", { albumId: id });
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Album not found",
				});
			}

			if (album.userId !== ctx.session.userId) {
				logger.error("User is not the owner of the album {albumId}", {
					albumId: id,
				});
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You cannot update an album you don't own!",
				});
			}

			await ctx.db.album.update({
				where: {
					id,
				},
				data: {
					name: newName,
					description: newDescription,
				},
			});
		},
	);
