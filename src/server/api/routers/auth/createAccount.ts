import { publicProcedure } from "@cryptalbum/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const createAccount = publicProcedure
	.input(
		z.object({
			email: z.string().email(),
			publicKey: z.string(),
			deviceName: z.string(),
			name: z.string(),
			symmetricalKey: z.string(),
		}),
	)
	.mutation(
		async ({
			input: { email, publicKey, deviceName, name, symmetricalKey },
			ctx,
		}) => {
			console.info(`Creating account for ${email}`);
			try {
				const userExists = await ctx.db.user.findUnique({
					where: { email },
				});
				if (userExists) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "User already exists",
					});
				}
				const user = await ctx.db.user.create({
					data: {
						email,
						name,
						devices: {
							create: {
								name: deviceName,
								publicKey,
								symmetricalKey,
							},
						},
					},
				});
				console.info(`Account created for ${email} with id ${user.id}`);
			} catch (error) {
				console.error(
					`Failed to create account for ${email} with error: ${JSON.stringify(
						error,
					)}`,
				);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create account",
				});
			}
		},
	);
