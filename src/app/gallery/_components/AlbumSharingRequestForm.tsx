"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@cryptalbum/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@cryptalbum/components/ui/form";
import { Input } from "@cryptalbum/components/ui/input";
import { ToastAction } from "@cryptalbum/components/ui/toast";
import { useToast } from "@cryptalbum/components/ui/use-toast";
import {
	decrypt,
	encrypt,
	importRsaPublicKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/utils/api";
import type { AlbumInProps } from "./types";

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export default function AlbumSharingRequestForm({ album }: AlbumInProps) {
	const { toast } = useToast();
	const trpcUtils = api.useUtils();
	const shareAlbumMutation = api.album.shareAlbum.useMutation();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		form.reset();
		const keyPair = await loadKeyPair();
		if (!keyPair) {
			return;
		}

		const { email } = values;
		try {
			const userDevices = await trpcUtils.auth.getUserDevices.fetch({ email });
			if (!userDevices || userDevices.length === 0) {
				toast({
					title: "No devices found",
					description: `No devices found for user ${email}`,
					variant: "destructive",
					action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
				});
				return;
			}

			const decipheredAlbumSymmetricalKey = await decrypt(
				keyPair.privateKey,
				Buffer.from(album.encryptionKey, "hex"),
			);

			const symKeyEncryptedWithDevicesKey = await Promise.all(
				userDevices.map(async (device) => {
					const devicePublicKey = await importRsaPublicKey(device.publicKey);
					const encryptedSymKey = await encrypt(
						devicePublicKey,
						decipheredAlbumSymmetricalKey,
					);
					return { deviceId: device.id, encryptedSymKey };
				}),
			);

			await shareAlbumMutation.mutateAsync({
				albumId: album.id,
				symmetricalKeys: symKeyEncryptedWithDevicesKey,
				email,
			});

			toast({
				title: "Album shared",
				description: `Album shared with ${email}`,
				variant: "default",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "An error occurred";

			toast({
				title: "Album sharing error",
				description: message,
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>email</FormLabel>
							<FormControl>
								<Input placeholder="me@example.com" {...field} />
							</FormControl>
							<FormDescription>
								This is the email address of the person you want to share your
								album with.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full">
					Submit
				</Button>
			</form>
		</Form>
	);
}
