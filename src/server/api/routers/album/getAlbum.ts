import { z } from "zod";

import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { Album, AlbumWithAtLeastOneSharedKey } from "./index";

function albumHasASharedKey(
	album: Album,
): album is AlbumWithAtLeastOneSharedKey {
	return album.shareds.length > 0;
}

export const getAlbum = protectedProcedure
	.input(z.string())
	.query(async ({ ctx, input: albumId }) => {
		const logger = ctx.logWrapper.enrichWithAction("GET_ALBUM").create();

		logger.info("Fetching album {albumId}", albumId);

		const album: Album | null = await ctx.db.album.findUnique({
			where: {
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
						deviceId: ctx.session.user.id,
					},
				},
			},
		});

		if (!album || !albumHasASharedKey(album)) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Album not found or you don't have access to it",
			});
		}

		return {
			id: album.id,
			name: album.name,
			description: album.description,
			encryptionKey: album.shareds[0].key,
		};
	});
