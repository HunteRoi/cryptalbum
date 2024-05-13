import { protectedProcedure } from "@cryptalbum/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const trustDevice = protectedProcedure
	.input(
		z.object({
			deviceId: z.string(),
			symmetricalKey: z.string(),
			deviceName: z.string(),
		}),
	)
	.mutation(
		async ({ input: { deviceId, symmetricalKey, deviceName }, ctx }) => {
			console.info(`Trusting device ${deviceId}`);
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
			await ctx.db.userDevice.update({
				where: { id: deviceId },
				data: { symmetricalKey, name: deviceName },
			});
			console.info(`Device ${deviceId} is now trusted`);
		},
	);
