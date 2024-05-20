import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const shareAlbum = protectedProcedure
	.input(
		z.object({
			albumId: z.string(),
			symmetricalKeys: z.array(
				z.object({ deviceId: z.string(), encryptedSymKey: z.string() }),
			),
			email: z.string().email("Invalid email address"),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const logger = ctx.logWrapper.enrichWithAction("SHARE_ALBUM").create();

		logger.info(
			"Sharing album {albumId} with email {email}",
			input.albumId,
			input.email,
		);

		const user = await ctx.db.user.findUnique({
			where: {
				email: input.email,
			},
		});

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}

		const album = await ctx.db.album.findUnique({
			where: {
				id: input.albumId,
			},
		});

		if (!album) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Album not found",
			});
		}

		if (album.userId !== ctx.session.userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You are not the owner of this album",
			});
		}

		await ctx.db.album.update({
			where: {
				id: album.id,
			},
			data: {
				shareds: {
					createMany: {
						data: input.symmetricalKeys.map((symmetricalKey) => ({
							key: symmetricalKey.encryptedSymKey,
							userId: user.id,
							deviceId: symmetricalKey.deviceId,
						})),
					},
				},
			},
		});
	});
