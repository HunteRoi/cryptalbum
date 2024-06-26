import { authRouter } from "@cryptalbum/server/api/routers/auth";
import { imageRouter } from "@cryptalbum/server/api/routers/image";
import { albumRouter } from "@cryptalbum/server/api/routers/album";
import {
	createCallerFactory,
	createTRPCRouter,
} from "@cryptalbum/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	auth: authRouter,
	image: imageRouter,
	album: albumRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
