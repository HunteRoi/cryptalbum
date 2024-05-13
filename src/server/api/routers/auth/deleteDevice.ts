import { protectedProcedure } from "@cryptalbum/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const deleteDevice = protectedProcedure
	.input(
		z.object({
			deviceId: z.string(),
		}),
	)
	.mutation(async ({ input: { deviceId }, ctx }) => {
		const logger = ctx.logWrapper.enrichWithAction("DELETE_DEVICE").create();

		logger.info('Deleting device {deviceId}', deviceId);
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
		await ctx.db.userDevice.delete({
			where: { id: deviceId },
		});
		logger.info('Device {deviceId} deleted', deviceId);
	});
