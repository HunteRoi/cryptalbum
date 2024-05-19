import { zodResolver } from "@hookform/resolvers/zod";
import { PenLine } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import {
	Form,
	FormControl,
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
import type { ImageInProps } from "./types";

type ImageUpdateDialogProps = ImageInProps & { name?: string };

const formSchema = z.object({
	newName: z.string(),
});

export default function ImageUpdateDialog({
	image,
	name,
}: ImageUpdateDialogProps) {
	const searchParams = useParams();
	const albumId = searchParams.albumId as string;
	const userData = useUserData();
	const router = useRouter();
	const { toast } = useToast();
	const trpcUtils = api.useUtils();
	const imageUpdateMutation = api.image.update.useMutation();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			newName: name,
		},
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		const keyPair = await loadKeyPair();
		if (!userData || !keyPair) {
			toast({
				title: "Error",
				description: "You need to be logged in to update an image.",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});

			router.push("/login");
			return;
		}

		const { newName } = data;
		if (newName === name) {
			toast({
				title: "Error while updating image",
				description: "The new name must be different from the current one.",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});

			return;
		}

		try {
			const decipheredSymmetricalKey = await decrypt(
				keyPair.privateKey,
				Buffer.from(image.encryptionKey, "hex"),
			);
			const importedSymmetricalKey = await importSymmetricalKey(
				decipheredSymmetricalKey,
			);
			const encryptedNewName = await encryptFormValue(
				newName,
				importedSymmetricalKey,
			);

			await imageUpdateMutation.mutateAsync({
				imageId: image.id,
				newName: encryptedNewName,
			});

			toast({
				title: "Image updated",
				description: "The image has been updated successfully.",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			if (albumId) {
				await trpcUtils.image.getAlbumImages.invalidate();
			} else {
				await trpcUtils.image.getImages.invalidate();
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred";

			toast({
				title: "Error while updating image",
				description: errorMessage,
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
		}
	};

	return (
		<Dialog>
			<DialogTrigger>
				<Button>
					<PenLine />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Image {name}</DialogTitle>
					<DialogDescription>
						You can change the image's name here.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="newName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>File name</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="My awesome picture"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="pt-5">
							<Button type="submit">Update</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
