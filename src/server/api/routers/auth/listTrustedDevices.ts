import { protectedProcedure } from "@cryptalbum/server/api/trpc";

export const listTrustedDevices = protectedProcedure.query(async ({ ctx }) => {
	ctx.logWrapper
		.enrichWithAction("LIST_TRUSTED_DEVICES")
		.create()
		.info("Listing trusted devices");
	return ctx.db.userDevice.findMany({
		where: { symmetricalKey: { not: null }, userId: ctx.session.userId },
	});
});
