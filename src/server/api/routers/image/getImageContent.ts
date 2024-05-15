import { env } from "@cryptalbum/env";
import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

export const getImageContent = protectedProcedure
	.input(z.string())
	.query(async ({ ctx, input: imageId }) => {
		const logger = ctx.logWrapper.enrichWithAction("GET_IMAGE_FILE").create();

		logger.info("Fetching image {imageId}", imageId);

		const picture = await ctx.db.picture.findFirst({
			where: {
				id: imageId,
				shareds: {
					some: {
						userId: ctx.session.userId,
					},
				},
			},
		});

		if (!picture) {
			logger.error("Image with {imageID} does not exist", imageId);
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Image not found",
			});
		}

		const contentsStream = await ctx.minio.getObject(
			env.MINIO_BUCKET,
			picture.id,
		);
		let data = "";

		contentsStream.on("data", (chunk) => {
			data += chunk;
		});

		return new Promise<string>((resolve, reject) => {
			contentsStream.on("end", () => {
				resolve(data);
			});

			contentsStream.on("error", (err) => {
				reject(err);
			});
		});
	});
