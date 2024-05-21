import { protectedProcedure } from "@cryptalbum/server/api/trpc";

export const getSharedKeys = protectedProcedure.query(async ({ ctx }) => {
	const logger = ctx.logWrapper.enrichWithAction("GET_SHARED_KEYS").create();

	logger.info("Getting shared keys");

	return ctx.db.sharedKey.findMany({
		where: {
			userId: ctx.session.userId,
			deviceId: ctx.session.user.id,
		},
		select: {
			id: true,
			key: true,
		},
	});
});
