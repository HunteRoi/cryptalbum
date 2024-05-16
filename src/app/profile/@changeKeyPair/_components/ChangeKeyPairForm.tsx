import React from "react";
import { useForm } from "react-hook-form";

import {
	type UserData,
	useUserData,
} from "@cryptalbum/components/providers/UserDataProvider";
import { Button } from "@cryptalbum/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@cryptalbum/components/ui/dialog";
import { Form } from "@cryptalbum/components/ui/form";
import { useToast } from "@cryptalbum/components/ui/use-toast";
import {
	encrypt,
	exportAsymmetricalKey,
	exportSymmetricalKey,
	generateAsymmetricalKeyPair,
	loadKeyPair,
	storeKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/trpc/react";
import { signOut } from "next-auth/react";

export default function ChangeKeyPairForm() {
	const userData = useUserData() as UserData;
	const { toast } = useToast();
	const form = useForm({});
	const changeDevicePublicKeyMutation =
		api.auth.changeDevicePublicKey.useMutation();

	const onSubmit = async () => {
		const keyPair = await loadKeyPair();
		if (!keyPair) {
			return;
		}

		const newKeyPair = await generateAsymmetricalKeyPair();
		const [newPublicKey, encryptedSymmetricalKey] = await Promise.all([
			exportAsymmetricalKey(newKeyPair.publicKey),
			encrypt(
				newKeyPair.publicKey,
				await exportSymmetricalKey(userData.symmetricalKey),
			),
		]);

		await changeDevicePublicKeyMutation.mutateAsync({
			publicKey: newPublicKey,
			encryptedSymmetricalKey: btoa(encryptedSymmetricalKey),
		});

		await storeKeyPair(newKeyPair);

		toast({
			title: "Key pair changed",
			description: "Your key pair has been changed successfully",
		});

		await signOut({ callbackUrl: "/" });
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="w-full">
					Generate a new key pair for this device
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						Are you sure you want to generate a new key pair ?
					</DialogTitle>
					<DialogDescription>
						You will be automatically logged out and you will need to log in
						again.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<Button type="submit" className="w-full">
								I am sure, generate a new one
							</Button>
						</form>
					</Form>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
