// biome-ignore lint/style/useNodejsImportProtocol:
import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { encrypt, importRsaPublicKey } from "@cryptalbum/crypto";
import { createTRPCRouter, publicProcedure } from "@cryptalbum/server/api/trpc";

export const authRouter = createTRPCRouter({
	createAccount: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				publicKey: z.string(),
				deviceName: z.string(),
				name: z.string(),
			}),
		)
		.mutation(
			async ({ input: { email, publicKey, deviceName, name }, ctx }) => {
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
									isTrusted: true,
									publicKey,
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
		),
	challenge: publicProcedure
		.input(
			z.object({
				publicKey: z.string(),
			}),
		)
		.mutation(async ({ input: { publicKey }, ctx }) => {
			console.info(`Creating challenge for device ${publicKey}`);
			const userDevice = await ctx.db.userDevice.findUnique({
				where: { publicKey },
			});
			if (!userDevice) {
				console.error(`Device not found for public key ${publicKey}`);
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Device not found",
				});
			}
			if (!userDevice.isTrusted) {
				console.error(`Device ${userDevice.id} is not trusted`);
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Device is not trusted",
				});
			}

			const key = await importRsaPublicKey(userDevice.publicKey);

			const challenge = randomBytes(64).toString("hex");
			try {
				const encryptedChallenge = await encrypt(key, challenge);
				const deviceChallenge = await ctx.db.userDeviceChallenge.create({
					data: {
						challenge,
						expires: new Date(Date.now() + 1000 * 60 * 5),
						isValidated: false,
						userDevice: {
							connect: {
								publicKey,
							},
						},
					},
				});

				console.info(`Challenge created for deviceId ${userDevice.id}`);
				return {
					challengerId: deviceChallenge.id,
					challenge: encryptedChallenge,
				};
			} catch (e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to upload file. Please try again.",
				});
			}
		}),
});
