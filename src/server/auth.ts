import { PrismaAdapter } from "@auth/prisma-adapter";
import {
	type DefaultSession,
	type NextAuthOptions,
	getServerSession,
} from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@cryptalbum/server/db";
import { unconfiguredLogger } from "./logger";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	//eslint-disable-next-line no-unused-vars
	interface Session extends DefaultSession {
		user: {
			id: string;
			email: string;
			deviceName: string;
			name: string;
			symmetricalKey: string;
		};
	}

	// interface User {
	//   id: string;
	//   ...other properties
	//   role: UserRole;
	// }
}

declare module "next-auth/jwt" {
	export interface JWT {
		id: string;
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	callbacks: {
		async session(data) {
			const user = data.session.user;
			const session = data.session;
			const userDevice = await db.userDevice.findFirst({
				where: { id: data.token.id },
			});

			if (user && userDevice) {
				const { name: deviceName, symmetricalKey } = userDevice;

				session.user = user;
				session.user.id = data.token.id;
				session.user.deviceName = deviceName as string;
				session.user.symmetricalKey = symmetricalKey as string;
			}

			return session;
		},
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.name = user.name;
			}
			return token;
		},
	},
	adapter: PrismaAdapter(db) as Adapter,
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { type: "email" },
				challenge: { type: "text" },
				challengeId: { type: "text" },
			},
			async authorize(credentials) {
				const defaultWrapper =
					unconfiguredLogger.enrichWithAction("AUTHENTICATE");
				const defaultLogger = defaultWrapper.create();

				if (!credentials) {
					defaultLogger.error("No credentials provided");
					return null;
				}
				if (!credentials.challengeId || !credentials.challenge) {
					defaultLogger.error("No challengeId or challenge provided");
					return null;
				}
				const challenge = await db.userDeviceChallenge.findFirst({
					where: {
						id: credentials.challengeId,
						challenge: credentials.challenge,
					},
					include: {
						userDevice: {
							include: {
								user: true,
							},
						},
					},
				});
				defaultLogger.info(
					"Logging attempt to {email} from deviceId {deviceId} with challengeId {challengeId}",
					credentials.email,
					challenge?.userDevice.id,
					challenge?.id,
				);
				if (
					!challenge ||
					challenge.isValidated ||
					!(challenge.expires > new Date())
				) {
					return null;
				}
				if (challenge.userDevice.user.email !== credentials.email) {
					return null;
				}

				const logger = defaultWrapper
					.enrichWithUserId(challenge.userDevice.user.id)
					.create();

				await db.userDeviceChallenge.update({
					where: {
						id: credentials.challengeId,
					},
					data: {
						isValidated: true,
					},
				});
				if (!challenge) {
					logger.error("No challenge found for {email}", credentials.email);
					return null;
				}
				if (!challenge.userDevice.symmetricalKey) {
					logger.error(
						"Device {deviceId} is not trusted for user {email}",
						challenge.userDevice.id,
						challenge.userDevice.user.email,
					);
					return null;
				}
				await db.userDevice.update({
					where: {
						id: challenge.userDevice.id,
					},
					data: {
						lastLogin: new Date(),
					},
				});

				logger.info(
					"User {email} logged in with device {deviceId}",
					challenge.userDevice.user.email,
					challenge.userDevice.id,
				);
				return {
					id: challenge.userDevice.id,
					email: credentials.email,
					name: challenge.userDevice.user.name,
				};
			},
		}),
		/**
		 * ...add more providers here.
		 *
		 * Most other providers require a bit more work than the Discord provider. For example, the
		 * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
		 * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
		 *
		 * @see https://next-auth.js.org/providers/github
		 */
	],

	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
		updateAge: 24 * 60 * 60,
	},
	pages: {
		// custom pages
		signIn: "/auth/login",
	},
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
