import { useEffect, useState } from "react";

import { getCsrfToken } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useUserData } from "@cryptalbum/components/providers/UserDataProvider";
import { Button } from "@cryptalbum/components/ui/button";
import { Input } from "@cryptalbum/components/ui/input";
import { Label } from "@cryptalbum/components/ui/label";
import { toast } from "@cryptalbum/components/ui/use-toast";
import {
	clearKeyPair,
	decrypt,
	exportAsymmetricalKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/trpc/react";

type State = {
	csrfToken: string | undefined;
	challenge:
		| {
				id: string;
				data: string;
		  }
		| undefined;
};

export function LoginForm() {
	const challengeMutation = api.auth.challenge.useMutation();
	const router = useRouter();
	const [state, setState] = useState<State>();
	const userData = useUserData();

	useEffect(() => {
		if (userData) {
			router.push("/gallery");
		}
	}, [userData, router]);

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
						} else {
							toast({
								title: "Error",
								description:
									"Your device is not yet officially linked to an account. Please try again when it is.",
								variant: "destructive",
							});
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: This is a one-time effect
	useEffect(() => {
		void validChallenge();
	}, []);

	return (
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
				<input name="csrfToken" type="hidden" defaultValue={state?.csrfToken} />
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
		</form>
	);
}
