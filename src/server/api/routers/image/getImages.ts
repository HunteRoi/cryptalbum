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
	NonNullable<NonEmptyArray<SharedKey>>
>;

export const getImages = protectedProcedure.query(async ({ ctx }) => {
	const logger = ctx.logWrapper.enrichWithAction("GET_USER_IMAGES").create();

	logger.info("Fetching images");

	const images = await ctx.db.picture.findMany({
		where: {
			albumId: null,
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
					device: true,
				},
				where: {
					userId: ctx.session.userId,
					deviceId: ctx.session.user.id,
				},
			},
		},
	});

	return images
		.filter(
			(image: Image): image is ImageWithAtLeastOneSharedKey =>
				image.shareds.length > 0,
		)
		.map(({ shareds, ...imageData }) => {
			return {
				...imageData,
				encryptionKey: shareds[0]!.key,
			};
		});
});
