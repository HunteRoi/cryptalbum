import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { renderableActions } from "@cryptalbum/server/logger/actions";

export const checkActivity = protectedProcedure.query(async ({ ctx }) => {
	const { userId } = ctx.session;

	return ctx.db.log.findMany({
		where: {
			userId,
			action: {
				in: renderableActions,
			},
		},
		select: {
			id: true,
			message: true,
			createdAt: true,
		},
	});
});
