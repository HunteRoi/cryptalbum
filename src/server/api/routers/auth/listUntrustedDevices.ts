import { protectedProcedure } from "@cryptalbum/server/api/trpc";

export const listUntrustedDevices = protectedProcedure.query(
	async ({ ctx }) => {
		console.info("Listing untrusted devices");
		return ctx.db.userDevice.findMany({
			where: { symmetricalKey: null, userId: ctx.session.userId },
		});
	},
);
