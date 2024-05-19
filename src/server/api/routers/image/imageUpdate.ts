import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const imageUpdate = protectedProcedure
	.input(
		z.object({
			imageId: z.string(),
			newName: z.string(),
		}),
	)
	.mutation(async ({ ctx, input: { imageId, newName } }) => {
		const logger = ctx.logWrapper.enrichWithAction("UPDATE_IMAGE").create();

		logger.info("Updating image {imageId} with new name", imageId);

		const image = await ctx.db.picture.findUnique({
			where: {
				id: imageId,
			},
		});

		if (!image) {
			logger.error("Image {imageId} not found", imageId);
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Image not found",
			});
		}

		if (image.userId !== ctx.session.userId) {
			logger.error("User is not the owner of the image {imageId}", imageId);
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You cannot update an image you don't own!",
			});
		}

		await ctx.db.picture.update({
			where: {
				id: imageId,
			},
			data: {
				name: newName,
			},
		});
	});
