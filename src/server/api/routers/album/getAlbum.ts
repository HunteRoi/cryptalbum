import { z } from "zod";

import { protectedProcedure } from "@cryptalbum/server/api/trpc";

export const getAlbum = protectedProcedure
	.input(z.string())
	.query(async ({ ctx, input: albumId }) => {
	const logger = ctx.logWrapper.enrichWithAction("GET_ALBUMS").create();

	logger.info("Fetching album {albumId} : ", { albumId });

	const album = await ctx.db.album.findUnique({
		where: {
			userId: ctx.session.userId,
			id: albumId,
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

	if (!album || album.shareds.length === 0) {
		return null;
	}
	return {
		id: album.id,
		name: album.name,
		description: album.description,
		encryptionKey: album.shareds[0]!.key,
	};
});
