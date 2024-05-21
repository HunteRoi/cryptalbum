import { protectedProcedure } from "@cryptalbum/server/api/trpc";

export const whoami = protectedProcedure.query(async ({ ctx }) => {
	if (!ctx.session) {
		return null;
	}

	const device = await ctx.db.userDevice.findUnique({
		where: {
			id: ctx.session.user.id,
		},
	});

	if (!device) {
		return null;
	}

	return ctx.session.user;
});
