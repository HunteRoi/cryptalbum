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
		console.info(`Creating device for ${email}`);
		const user = await ctx.db.user.findUnique({
			where: { email },
		});
		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}
		try {
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
			console.info(`Device created for ${email} with id ${userDevice.id}`);

			return userDevice.id;
		} catch (error) {
			console.error(
				`Failed to create device for ${email} with error: ${JSON.stringify(
					error,
				)}`,
			);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to create device",
			});
		}
	});
