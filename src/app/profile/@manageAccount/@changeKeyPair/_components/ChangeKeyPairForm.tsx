import { signOut } from "next-auth/react";
import React from "react";
import { useForm } from "react-hook-form";

import { useUserData } from "@cryptalbum/components/providers/UserDataProvider";
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
	decrypt,
	encrypt,
	encryptFormValue,
	exportAsymmetricalKey,
	exportSymmetricalKey,
	generateAsymmetricalKeyPair,
	loadKeyPair,
	storeKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/utils/api";

export default function ChangeKeyPairForm() {
	const userData = useUserData()!;
	const { toast } = useToast();
	const form = useForm();
	const trpcUtils = api.useUtils();
	const changeDevicePublicKeyMutation =
		api.auth.changeDevicePublicKey.useMutation();

	const onSubmit = async () => {
		const keyPair = await loadKeyPair();
		if (!keyPair) {
			return;
		}

		const sharedKeys = await trpcUtils.auth.getSharedKeys.fetch();
		const newKeyPair = await generateAsymmetricalKeyPair();
		const [newPublicKey, encryptedSymmetricalKey, ...updatedSharedKeys] =
			await Promise.all([
				exportAsymmetricalKey(newKeyPair.publicKey),
				encryptFormValue(
					await exportSymmetricalKey(userData.symmetricalKey),
					newKeyPair.publicKey,
				),
				...sharedKeys.map(async ({ id, key }) => {
					return {
						id,
						newKey: await encrypt(
							newKeyPair.publicKey,
							await decrypt(keyPair.privateKey, Buffer.from(key, "hex")),
						),
					};
				}),
			]);

		await changeDevicePublicKeyMutation.mutateAsync({
			publicKey: newPublicKey,
			encryptedSymmetricalKey: encryptedSymmetricalKey,
			updatedSharedKeys,
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
						Are you sure you want to generate a new key pair?
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
