import {protectedProcedure} from "@cryptalbum/server/api/trpc";

import {TRPCError} from "@trpc/server";
import {z} from "zod";

export const trustDevice = protectedProcedure
	.input(
		z.object({
			deviceId: z.string(),
			symmetricalKey: z.string(),
			symmetricalKeysWithImage: z.array(
				z.object({
					imageId: z.string(),
					symmetricalKey: z.string(),
				}),
			),
			symmetricalKeysWithAlbum: z.array(
				z.object({
					albumId: z.string(),
					symmetricalKey: z.string(),
				}),
			),
			deviceName: z.string(),
		}),
	)
	.mutation(
		async ({
			input: { deviceId, symmetricalKey, symmetricalKeysWithImage, symmetricalKeysWithAlbum, deviceName },
			ctx,
		}) => {
			const logger = ctx.logWrapper.enrichWithAction("TRUST_DEVICE").create();

			logger.info("Trusting device {deviceId}", deviceId);
			const device = await ctx.db.userDevice.findUnique({
				where: { id: deviceId },
			});
			if (!device) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Device not found",
				});
			}
			if (device.userId !== ctx.session.userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Device does not belong to user",
				});
			}

			const deviceSharedKeys = await ctx.db.sharedKey.findMany({
				where: { deviceId: ctx.session.user.id, NOT: { albumId: null } },
			});
			const deviceSharedKeysWithPicture = deviceSharedKeys.filter((sharedKey) => sharedKey.photoId !== null);

			await ctx.db.userDevice.update({
				where: { id: deviceId },
				data: {
					symmetricalKey,
					name: deviceName,
					shareds: {
						createMany: {
							data: [
								...symmetricalKeysWithImage.map((symmetricalKeyWithImage) => ({
									key: symmetricalKeyWithImage.symmetricalKey,
									userId: ctx.session.userId,
									photoId: symmetricalKeyWithImage.imageId,
								})),
								...symmetricalKeysWithAlbum.map((symmetricalKeyWithAlbum) => ({
									key: symmetricalKeyWithAlbum.symmetricalKey,
									userId: ctx.session.userId,
									albumId: symmetricalKeyWithAlbum.albumId,
								})),
								...deviceSharedKeysWithPicture.map((sharedKey) => ({
									key: sharedKey.key,
									userId: ctx.session.userId,
									photoId: sharedKey.photoId,
									albumId: sharedKey.albumId,
								})),
							]
						},
					},
				},
			});
			logger.info("Device {deviceId} is now trusted", deviceId);
		},
	);
