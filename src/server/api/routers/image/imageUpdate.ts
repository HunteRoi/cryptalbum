import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { AlbumSharedKeys } from ".";

// in the case of moving an image to another album, we differentiate between moving it to an album and moving it outside of any album
// so we use value for newAlbum :
// - album object if we want to move the image to an album
// - null if we want to move the image outside of any album
// - undefined if we don't want to move the image

export const imageUpdate = protectedProcedure
	.input(
		z.object({
			imageId: z.string(),
			newName: z.string().optional(),
			newAlbum: z
				.object({
					id: z.string(),
					key: z.string(),
				})
				.or(z.null())
				.optional(),
		}),
	)
	.mutation(async ({ ctx, input: { imageId, newName, newAlbum } }) => {
		const logger = ctx.logWrapper.enrichWithAction("UPDATE_IMAGE").create();

		logger.info("Updating image {imageId} with new name", imageId);

		const image = await ctx.db.picture.findUnique({
			where: {
				id: imageId,
			},
		});

		if (!image) {
			logger.error("Image {imageId} not found", imageId);
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Image not found",
			});
		}

		if (image.userId !== ctx.session.userId) {
			logger.error("User is not the owner of the image {imageId}", imageId);
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You cannot update an image you don't own!",
			});
		}

		if (newName) {
			// update the name of the image
			await ctx.db.picture.update({
				where: {
					id: imageId,
				},
				data: {
					name: newName,
				},
			});
		}

		if (newAlbum !== undefined) {
			// update the album of the image
			if (newAlbum !== null) {
				// move the image to an other album
				const album = await ctx.db.album.findUnique({
					where: {
						id: newAlbum.id,
					},
				});

				if (!album) {
					logger.error("Album {newAlbum.id} not found", newAlbum);
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Album not found",
					});
				}

				if (album.userId !== ctx.session.userId) {
					logger.error(
						"User is not the owner of the album {newAlbum.id}",
						newAlbum,
					);
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You cannot update an image to an album you don't own!",
					});
				}

				await ctx.db.$transaction(async (database) => {
					if (image.albumId) {
						// move the image from an album to an other album
						await database.picture.update({
							where: {
								id: imageId,
							},
							data: {
								albumId: newAlbum.id,
							},
						});
						await database.sharedKey.updateMany({
							where: {
								photoId: imageId,
								albumId: { not: null },
							},
							data: {
								albumId: newAlbum.id,
								key: newAlbum.key,
							},
						});
					} else {
						// move the image from outside of any album to an album
						const userDevices = await ctx.db.userDevice.findMany({
							where: {
								userId: ctx.session.userId,
							},
						});
						const albumSharedKeys = userDevices.map((userDevice) => {
							return {
								key: newAlbum.key,
								userId: ctx.session.userId,
								deviceId: userDevice.id,
								albumId: newAlbum.id,
							};
						}) as AlbumSharedKeys;
						await database.picture.update({
							where: {
								id: imageId,
							},
							data: {
								albumId: newAlbum.id,
								shareds: {
									createMany: {
										data: albumSharedKeys,
									},
								}
							},
						});
					}
				});
			} else {
				// move the image outside of any album
				await ctx.db.$transaction(async (database) => {
					await database.picture.update({
						where: {
							id: imageId,
						},
						data: {
							albumId: null,
						},
					});
					await database.sharedKey.deleteMany({
						where: {
							photoId: imageId,
							albumId: { not: null },
						},
					});
				});
			}
		}
	});
