import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { z } from "zod";

export const getUserDevices = protectedProcedure
	.input(
		z.object({
			email: z.string().email("Invalid email address"),
		}),
	)

	.query(async ({ ctx, input: { email } }) => {
		ctx.logWrapper
			.enrichWithAction("GET_USER_DEVICES")
			.create()
			.info("Listing trusted devices");
		return ctx.db.userDevice.findMany({
			where: { symmetricalKey: { not: null }, user: { email } },
			select: {
				id: true,
				publicKey: true,
			},
		});
	});
