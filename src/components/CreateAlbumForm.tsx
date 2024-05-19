"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
	encrypt,
	encryptFormValue,
	exportSymmetricalKey,
	generateSymmetricalKey,
	importRsaPublicKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/trpc/react";
import { useUserData } from "./providers/UserDataProvider";
import { Button } from "./ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { ToastAction } from "./ui/toast";
import { useToast } from "./ui/use-toast";

const formSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
});

export default function CreateAlbumForm() {
	const { toast } = useToast();
	const userData = useUserData();
	const { data: userDevices } = api.auth.listTrustedDevices.useQuery();
	const createAlbumMutation = api.album.create.useMutation();
	const trpcUtils = api.useUtils();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		const keyPair = await loadKeyPair();

		if (!userData || !keyPair) {
			return;
		}
		if (!data.name) {
			form.setError("name", {
				type: "manual",
				message: "Album name is required",
			});
			toast({
				title: "Error",
				description: "Album name is required",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			return;
		}
		try {
			const cryptoKey = await generateSymmetricalKey();
			const exportedKey = await exportSymmetricalKey(cryptoKey);
			const [encryptedAlbumName, ...symmetricalKeysWithDevice] =
				await Promise.all([
					encryptFormValue(data.name, cryptoKey),
					...(userDevices || []).map(async (device) => {
						const publicKey = await importRsaPublicKey(device.publicKey);
						const encryptedSymmetricalKey = await encrypt(
							publicKey,
							exportedKey,
						);

						return {
							symmetricalKey: encryptedSymmetricalKey,
							deviceId: device.id,
						};
					}),
				]);
			let encryptedAlbumDescription = undefined;
			if (data.description) {
				encryptedAlbumDescription = await encryptFormValue(
					data.description,
					cryptoKey,
				);
			}
			const payload = {
				name: encryptedAlbumName,
				description: encryptedAlbumDescription,
				symmetricalKeysWithDevice,
			};
			await createAlbumMutation.mutateAsync({
				payload,
				metadata: {
					requestDate: new Date(),
					requestSize: JSON.stringify(payload).length,
				},
			});

			form.reset();
			toast({
				title: "Album created",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			await trpcUtils.album.getAlbums.reset();
		} catch (error) {
			console.error(error);
			toast({
				title: "Failed to create album",
				description:
					"An error occurred while creating the album. Please try again later.",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="mx-auto p-10 w-[380px]"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Album name</FormLabel>
							<FormControl>
								<Input type="text" placeholder="My awesome album" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="pt-4" />
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Album description <span className="italic">(optional)</span>
							</FormLabel>
							<FormControl>
								<Input
									type="text"
									placeholder="My flowers are beautiful!"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex pt-4">
					<Button type="submit" className="mx-auto">
						Submit
					</Button>
				</div>
			</form>
		</Form>
	);
}
