import type { Extended, NonEmptyArray } from "@cryptalbum/@types";
import { protectedProcedure } from "@cryptalbum/server/api/trpc";

type SharedKey = {
	key: string;
};
type Album = {
	id: string;
	name: string;
	description: string | null;
	shareds: SharedKey[];
};
type AlbumWithAtLeastOneSharedKey = Extended<Album, "shareds", NonEmptyArray<SharedKey>>;

export const getAlbums = protectedProcedure.query(async ({ ctx }) => {
	const logger = ctx.logWrapper.enrichWithAction("GET_ALBUMS").create();

	logger.info("Fetching albums");

	const albums = await ctx.db.album.findMany({
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
			description: true,
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

	return albums
		.filter((album: Album): album is AlbumWithAtLeastOneSharedKey => album.shareds?.length > 0)
		.map(({ shareds, ...albumData }) => {
			return {
				...albumData,
				encryptionKey: shareds[0].key,
			};
		});
});
