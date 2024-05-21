import { z } from "zod";

import type { Extended, NonEmptyArray } from "@cryptalbum/@types";
import { protectedProcedure } from "@cryptalbum/server/api/trpc";

type SharedKey = {
	key: string;
};
type Image = {
	id: string;
	name: string;
	shareds: SharedKey[];
};
type ImageWithAtLeastOneSharedKey = Extended<
	Image,
	"shareds",
	NonEmptyArray<SharedKey>
>;

export const getAlbumImages = protectedProcedure
	.input(z.string())
	.query(async ({ ctx, input: albumId }) => {
		const logger = ctx.logWrapper.enrichWithAction("GET_USER_IMAGES").create();

		logger.info("Fetching images from album");

		const images = await ctx.db.picture.findMany({
			where: {
				albumId: albumId,
				shareds: {
					some: {
						userId: ctx.session.userId,
						deviceId: ctx.session.user.id,
						albumId: albumId,
					},
				},
			},
			select: {
				id: true,
				name: true,
				metadata: false,
				userId: true,
				shareds: {
					select: {
						key: true,
					},
					where: {
						deviceId: ctx.session.user.id,
						albumId: albumId,
					},
				},
			},
		});

		return images
			.filter(
				(image: Image): image is ImageWithAtLeastOneSharedKey =>
					image.shareds?.length > 0,
			)
			.map(({ shareds, ...imageData }) => {
				return {
					...imageData,
					encryptionKey: shareds[0]!.key,
				};
			});
	});
