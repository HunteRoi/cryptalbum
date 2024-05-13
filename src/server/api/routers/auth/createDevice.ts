import { publicProcedure } from "@cryptalbum/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const createDevice = publicProcedure
	.input(
		z.object({
			email: z.string().email(),
			publicKey: z.string(),
		}),
	)
	.mutation(async ({ input: { email, publicKey }, ctx }) => {
		const logger = ctx.logWrapper.enrichWithAction('CREATE_DEVICE').create();

		logger.info('Creating device for {email}', email);
		try {
			const user = await ctx.db.user.findUnique({
				where: { email },
			});
			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			const userDevice = await ctx.db.userDevice.create({
				data: {
					symmetricalKey: undefined,
					publicKey,
					user: {
						connect: {
							email,
						},
					},
				},
			});

			ctx.logWrapper.enrichWithUserId(user.id).create().info('Device created for {email} with id {deviceId}', email, userDevice.id);

			return userDevice.id;
		} catch (error) {
			logger.error('Failed to create device for {email} with error: {error}', email, error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to create device",
			});
		}
	});
