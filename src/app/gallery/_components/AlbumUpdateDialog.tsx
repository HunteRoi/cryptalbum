"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
	encryptFormValue,
	importSymmetricalKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/utils/api";

type AlbumUpdateDialogProps = {
	album: {
		id?: string;
		name: string;
		description?: string;
		encryptionKey: string;
	};
};

const formSchema = z.object({
	name: z.string().optional(),
	description: z.string().optional(),
});
export default function AlbumUpdateDialog({ album }: AlbumUpdateDialogProps) {
	const { toast } = useToast();
	const albumUpdateMutation = api.album.updateAlbum.useMutation();
	const trpcUtils = api.useUtils();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: album.name ?? "",
			description: album.description ?? "",
		},
	});

	const handleUpdate = async (data: z.infer<typeof formSchema>) => {
		const keyPair = await loadKeyPair();
		
		if (!album.id || !keyPair) {
			return;
		}

		if (
			(!data.name || data.name === album.name) &&
			(!data.description || data.description === album.description)
		) {
			toast({
				title: "No changes",
				description:
					"Please make some changes before trying to update the album.",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			return;
		}

		try {
			const decipheredAlbumSymmetricalKey = await decrypt(
				keyPair.privateKey,
				Buffer.from(album.encryptionKey, "hex"),
			);
			const albumSymmetricalKey = await importSymmetricalKey(
				decipheredAlbumSymmetricalKey,
			);

			const newData: { newName?: string; newDescription?: string } = {};

			if (data.name && data.name !== album.name) {
				newData.newName = await encryptFormValue(
					data.name,
					albumSymmetricalKey,
				);
			}

			if (data.description && data.description !== album.description) {
				newData.newDescription = await encryptFormValue(
					data.description,
					albumSymmetricalKey,
				);
			}

			await albumUpdateMutation.mutateAsync({
				albumId: album.id,
				...newData,
			});

			toast({
				title: "Album updated",
				description: `The album "${album.name}" has been updated into "${data.name}".`,
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});

			await trpcUtils.album.getAlbums.invalidate();
			await trpcUtils.album.getAlbum.invalidate();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "An error occurred";

			toast({
				title: "Update error",
				description: message,
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
		}
	};

	return (
		<Dialog>
			<DialogTrigger>
				<Button className="ml-2">Update</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update album &quot;{album.name}&quot;</DialogTitle>
					<DialogDescription>
						Update the album name and description
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleUpdate)}
						className="space-y-8"
					>
						<FormField
							control={form.control}
							name="name"
							defaultValue={album.name}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="My album" {...field} />
									</FormControl>
									<FormDescription>
										This is the name of your album.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input placeholder="My flowers are beautiful" {...field} />
									</FormControl>
									<FormDescription>
										This is the description of your album{" "}
										<span className="italic">(optional)</span>.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button>Update {album.name}</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
