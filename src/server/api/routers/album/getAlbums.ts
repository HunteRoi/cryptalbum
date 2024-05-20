import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import type { Album, AlbumWithAtLeastOneSharedKey } from "./index";

export const getAlbums = protectedProcedure.query(async ({ ctx }) => {
	const logger = ctx.logWrapper.enrichWithAction("GET_USER_ALBUMS").create();

	logger.info("Fetching albums");

	const albums = await ctx.db.album.findMany({
		where: {
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
					deviceId: ctx.session.user.id,
				},
			},
		},
	});

	return albums
		.filter(
			(album: Album): album is AlbumWithAtLeastOneSharedKey =>
				album.shareds.length > 0,
		)
		.map(({ shareds, ...albumData }) => {
			return {
				...albumData,
				encryptionKey: shareds[0].key,
			};
		});
});
