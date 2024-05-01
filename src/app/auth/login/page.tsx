"use client";

import { Button } from "@cryptalbum/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import { Input } from "@cryptalbum/components/ui/input";
import { Label } from "@cryptalbum/components/ui/label";
import {
	clearKeyPair,
	decrypt,
	exportAsymmetricalKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/trpc/react";
import type { GetServerSideProps } from "next";
import { getCsrfToken } from "next-auth/react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await getSession(context);
	if (session) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}
	return {
		props: {
			csrfToken: await getCsrfToken(context),
		},
	};
};

type State = {
	csrfToken: string | undefined;
	challenge:
		| {
				id: string;
				data: string;
		  }
		| undefined;
};

export default function Login() {
	const challengeMutation = api.auth.challenge.useMutation();
	const router = useRouter();
	const [state, setState] = useState<State>();

	async function validChallenge() {
		const keyPair = await loadKeyPair();
		if (!keyPair) {
			return;
		}
		const publicKey = await exportAsymmetricalKey(keyPair.publicKey);
		try {
			if (!publicKey) return;
			const challenge = await challengeMutation.mutateAsync(
				{ publicKey },
				{
					onError: (error) => {
						//if 404
						if (error.data?.code === "NOT_FOUND") {
							clearKeyPair();
							router.push("/auth/register");
						}
					},
				},
			);
			const buffer = Buffer.from(challenge.challenge, "hex");
			const decryptedChallenge = await decrypt(
				keyPair.privateKey,
				buffer.buffer,
			);

			if (!decryptedChallenge) return;

			setState({
				csrfToken: await getCsrfToken(),
				challenge: {
					id: challenge.challengerId,
					data: decryptedChallenge,
				},
			});
		} catch (error) {
			console.error(error);
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		void validChallenge();
	}, []);

	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Login</CardTitle>
				<CardDescription>
					Enter your email below to login to your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form method="post" action="/api/auth/callback/credentials">
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								name="email"
								placeholder="me@example.com"
								required
							/>
						</div>
						<input
							name="csrfToken"
							type="hidden"
							defaultValue={state?.csrfToken}
						/>
						<input
							name="challengeId"
							type="hidden"
							defaultValue={state?.challenge?.id}
						/>
						<input
							name="challenge"
							type="hidden"
							defaultValue={state?.challenge?.data}
						/>
						<Button type="submit" className="w-full">
							Login
						</Button>
					</div>
					<div className="mt-4 text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link href="/auth/register" className="underline">
							Sign up
						</Link>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
