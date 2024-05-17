"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { encrypt, encryptFormValue, exportSymmetricalKey, generateSymmetricalKey } from "@cryptalbum/crypto";
import { api } from "@cryptalbum/trpc/react";
import { useUserData } from "./providers/UserDataProvider";
import { useToast } from "./ui/use-toast";
import { ToastAction } from "./ui/toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const formSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
});

export default function CreateAlbumForm() {
	const { toast } = useToast();
	const userData = useUserData();
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
		if (!userData) {
			toast({
				title: "Error",
				description: "You need to be logged in to be able to create an album",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
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
			const encryptedKey = await encrypt(userData.symmetricalKey, exportedKey);
			const encryptedAlbumName = await encryptFormValue(
				data.name,
				cryptoKey,
			);
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
				symmetricalKey: encryptedKey,
				requestDate: new Date(),
			};
			await createAlbumMutation.mutateAsync({
				payload,
				metadata: {
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
				description: "The server trolled us, it want to be a teapot",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto p-10 w-[380px]">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Album name</FormLabel>
							<FormControl>
								<Input
									type="text"
									placeholder="My awesome album"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="pt-4"></div>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Album description <span className="italic">(optional)</span></FormLabel>
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
	)
};
