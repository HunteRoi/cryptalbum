import {
	createTRPCRouter,
	protectedProcedure,
} from "@cryptalbum//server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
	userDevice: protectedProcedure.query(async ({ ctx }) => {
		console.info(`Getting user devices for user ${ctx.session.userId}`);
		const userDevices = await ctx.db.userDevice.findMany({
			where: { userId: ctx.session.userId },
		});
		if (!userDevices) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}
		return userDevices;
	}),
});
