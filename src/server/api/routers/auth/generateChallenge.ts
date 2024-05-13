import { encrypt, importRsaPublicKey } from "@cryptalbum/crypto";
import { publicProcedure } from "@cryptalbum/server/api/trpc";

import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const generateChallenge = publicProcedure
	.input(
		z.object({
			publicKey: z.string(),
		}),
	)
	.mutation(async ({ input: { publicKey }, ctx }) => {
		const logger = ctx.logWrapper.enrichWithAction("GENERATE_CHALLENGE").create();

		logger.info('Creating challenge for device {publicKey}', publicKey);
		const userDevice = await ctx.db.userDevice.findUnique({
			where: { publicKey },
		});
		if (!userDevice) {
			logger.error('Device not found for public key {publicKey}', publicKey);
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Device not found",
			});
		}
		if (!userDevice.symmetricalKey) {
			logger.error('Device {deviceId} is not trusted', userDevice.id);
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

			logger.info('Challenge created for deviceId {deviceId}', userDevice.id);
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
	});
