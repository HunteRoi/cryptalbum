import { z } from "zod";

import { protectedProcedure } from "@cryptalbum/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const create = protectedProcedure
    .input(
        z.object({
            payload: z.object({
                name: z.string(),
                description: z.string().optional(),
                symmetricalKey: z.string(),
                requestDate: z.date(),
            }),
            metadata: z.object({
				requestSize: z.number().gt(0),
			}),
        }),
    )
    .mutation(async ({ ctx, input: { payload, metadata } }) => {
        const logger = ctx.logWrapper.enrichWithAction("CREATE_ALBUM").create();

        try {
            logger.info("Creating new album");

            await ctx.db.$transaction(async (database) => {
                await database.album.create({
                    data: {
                        userId: ctx.session.userId,
                        name: payload.name,
                        description: payload.description,
                        metadata: metadata,
                        shareds: {
                            create: {
                                key: payload.symmetricalKey,
                                userId: ctx.session.userId,
                            },
                        },
                    },
                });

                logger.info("Album created with {name}", payload.name);
            });
        } catch (error) {
            logger.error("Failed to create album with error: {error}", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to create album",
			});
        }
    });
