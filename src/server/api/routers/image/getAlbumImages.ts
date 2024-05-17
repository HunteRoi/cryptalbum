import { z } from "zod";

import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import type { Extended, NonEmptyArray } from "@cryptalbum/@types";

type SharedKey = {
	key: string;
};
type Image = {
	id: string;
	name: string;
	shareds: SharedKey[];
};
type ImageWithAtLeastOneSharedKey = Extended<Image, "shareds", NonEmptyArray<SharedKey>>;

export const getAlbumImages = protectedProcedure
	.input(z.string())
	.query(async ({ ctx, input: albumId }) => {
	const logger = ctx.logWrapper.enrichWithAction("GET_USER_IMAGES").create();

	logger.info("Fetching images from album");

	const images = await ctx.db.picture.findMany({
		where: {
			userId: ctx.session.userId,
			shareds: {
				some: {
					userId: ctx.session.userId,
				},
			},
			albumId: albumId,
		},
		select: {
			id: true,
			name: true,
			metadata: false,
			shareds: {
				select: {
					key: true,
				},
				where: {
					userId: ctx.session.userId,
				},
			},
		},
	});

	return images
		.filter((image: Image): image is ImageWithAtLeastOneSharedKey => image.shareds?.length > 0)
		.map(({ shareds, ...imageData }) => {
			return {
				...imageData,
				encryptionKey: shareds[0].key,
			};
		});
});
