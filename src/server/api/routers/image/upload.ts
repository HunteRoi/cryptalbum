import { env } from "@cryptalbum/env";
import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

type AlbumSharedKeys = Array<{
	key: string;
	userId: string;
	deviceId: string;
	albumId: string;
}>;

export const upload = protectedProcedure
	.input(
		z.object({
			payload: z.object({
				image: z.string(),
				imageName: z.string(),
				requestDate: z.date(),
				symmetricalKeysWithDevice: z.array(
					z.object({
						deviceId: z.string(),
						symmetricalKey: z.string(),
					}),
				),
				album: z
					.object({
						id: z.string(),
						symmetricalKey: z.string(),
					})
					.optional(),
			}),
			metadata: z.object({
				requestSize: z.number().gt(0),
			}),
		}),
	)
	.mutation(async ({ ctx, input: { payload, metadata } }) => {
		const logger = ctx.logWrapper.enrichWithAction("UPLOAD_IMAGE").create();

		try {
			if (payload.album) {
				logger.info("Uploading new image to album {albumId}", payload.album.id);
			} else {
				logger.info("Uploading new image");
			}
			const userDevices = await ctx.db.userDevice.findMany({
				where: {
					userId: ctx.session.userId,
				},
			});

			const albumSharedKeys = userDevices
				.map((userDevice) => {
					return payload.album
						? {
								key: payload.album.symmetricalKey,
								userId: ctx.session.userId,
								deviceId: userDevice.id,
								albumId: payload.album.id,
							}
						: undefined;
				})
				.filter((value) => value !== undefined) as AlbumSharedKeys;

			await ctx.db.$transaction(async (database) => {
				const { id } = await database.picture.create({
					data: {
						name: payload.imageName,
						metadata,
						shareds: {
							createMany: {
								data: [
									...payload.symmetricalKeysWithDevice.map(
										(symmetricalKeyWithDevice) => ({
											key: symmetricalKeyWithDevice.symmetricalKey,
											deviceId: symmetricalKeyWithDevice.deviceId,
											userId: ctx.session.userId,
										}),
									),
									...albumSharedKeys,
								],
							},
						},
						owner: {
							connect: {
								id: ctx.session.userId,
							},
						},
						album: {
							connect: payload.album
								? {
										id: payload.album.id,
									}
								: undefined,
						},
					},
				});

				const bucketExists = await ctx.minio.bucketExists(env.MINIO_BUCKET);
				if (!bucketExists) {
					await ctx.minio.makeBucket(env.MINIO_BUCKET, env.MINIO_REGION);
				}
				await ctx.minio.putObject(env.MINIO_BUCKET, id, payload.image);

				logger.info("Image uploaded with {id}", id);
			});
		} catch (error) {
			logger.error("Failed to upload image with error: {error}", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to upload image",
			});
		}
	});
