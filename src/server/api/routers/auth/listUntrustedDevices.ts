import {protectedProcedure} from "@cryptalbum/server/api/trpc";

export const listUntrustedDevices = protectedProcedure.query(
	async ({ ctx }) => {
		ctx.logWrapper.enrichWithAction('LIST_UNTRUSTED_DEVICES').create().info("Listing untrusted devices");
		return ctx.db.userDevice.findMany({
			where: {symmetricalKey: null, userId: ctx.session.userId},
			select: {
				id: true,
				publicKey: true,
				symmetricalKey: true,
				name: true,
				createdAt: true,
			}
		});
	},
);
