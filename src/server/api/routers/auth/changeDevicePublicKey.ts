import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { z } from "zod";

export const changeDevicePublicKey = protectedProcedure
	.input(
		z.object({
			publicKey: z.string(),
			encryptedSymmetricalKey: z.string(),
			updatedSharedKeys: z.array(
				z.object({
					id: z.string(),
					newKey: z.string(),
				}),
			),
		}),
	)
	.mutation(
		async ({
			ctx,
			input: { publicKey, encryptedSymmetricalKey, updatedSharedKeys },
		}) => {
			ctx.logWrapper
				.enrichWithAction("CHANGE_DEVICE_KEY_PAIR")
				.create()
				.info("Changing device key pair for {deviceId}", ctx.session.user.id);

			await ctx.db.userDevice.update({
				where: {
					id: ctx.session.user.id,
				},
				data: {
					publicKey,
					symmetricalKey: encryptedSymmetricalKey,
					shareds: {
						updateMany: updatedSharedKeys.map(({ id, newKey }) => ({
							where: {
								id,
							},
							data: {
								key: newKey,
							},
						})),
					},
				},
			});
		},
	);
