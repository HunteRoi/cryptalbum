import { env } from "@cryptalbum/env";
import { protectedProcedure } from "@cryptalbum/server/api/trpc";

export const deleteUser = protectedProcedure.mutation(async ({ ctx }) => {
	const logger = ctx.logWrapper.enrichWithAction("DELETE_USER").create();
	logger.info("Deleting user {userId}", ctx.session.userId);

	const images = await ctx.db.picture.findMany({
		where: { userId: ctx.session.userId },
	});

	ctx.db.$transaction(async (db) => {
		await ctx.minio.removeObjects(
			env.MINIO_BUCKET,
			images.map((image) => image.id),
		);

		await db.user.delete({
			where: { id: ctx.session.userId },
		});
	});
	logger.info("User {userId} deleted", ctx.session.userId);
});
