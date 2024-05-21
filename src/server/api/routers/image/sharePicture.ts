import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const sharePicture = protectedProcedure
	.input(
		z.object({
			imageId: z.string(),
			symmetricalKeys: z.array(
				z.object({ deviceId: z.string(), encryptedSymKey: z.string() }),
			),
			email: z.string().email("Invalid email address"),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const logger = ctx.logWrapper.enrichWithAction("SHARE_PICTURE").create();

		logger.info(
			"Sharing picture {imageId} with email {email}",
			input.imageId,
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

		const image = await ctx.db.picture.findUnique({
			where: {
				id: input.imageId,
			},
			select: {
				id: true,
				userId: true,
				albumId: true,
				shareds: {
					select: {
						userId: true,
						deviceId: true,
						albumId: true,
					},
				},
			},
		});

		if (!image) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Image not found",
			});
		}

		if (image.userId !== ctx.session.userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You are not allowed to share this image",
			});
		}

		if (image.shareds.some((shared) => shared.userId === user.id)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Image is already shared with this user",
			});
		}

		await ctx.db.picture.update({
			where: {
				id: image.id,
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
