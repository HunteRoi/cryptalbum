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

export const getImages = protectedProcedure.query(async ({ ctx }) => {
	const logger = ctx.logWrapper.enrichWithAction("GET_USER_IMAGES").create();

	logger.info("Fetching images");

	const images = await ctx.db.picture.findMany({
		where: {
			userId: ctx.session.userId,
			shareds: {
				some: {
					userId: ctx.session.userId,
				},
			},
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
