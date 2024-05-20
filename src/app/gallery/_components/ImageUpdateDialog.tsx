import { zodResolver } from "@hookform/resolvers/zod";
import { PenLine } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import DropDownList from "@cryptalbum/components/DropDownList";
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
	decryptFormValue,
	encrypt,
	encryptFormValue,
	importSymmetricalKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/utils/api";
import type { ImageInProps } from "./types"; // in the case of moving an image to another album, we differentiate between moving it to an album and moving it outside of any album

// in the case of moving an image to another album, we differentiate between moving it to an album and moving it outside of any album
// so we use value for newAlbum :
// - album object if we want to move the image to an album
// - null if we want to move the image outside of any album
// - undefined if we don't want to move the image

type ImageUpdateDialogProps = ImageInProps & { name?: string };

const formSchema = z.object({
	newName: z.string().optional(),
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
	const { data: albumList } = api.album.getAlbums.useQuery();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values: {
			newName: name,
		},
	});

	const [albumData, setAlbumData] = useState<
		Array<{ value: string; label: string }>
	>([]);
	const [selectedAlbumId, setSelectedAlbumId] = useState(albumId ?? "");

	const decipheredAlbumList = useCallback(async () => {
		const keyPair = await loadKeyPair();
		if (!userData || !albumList || !keyPair) {
			return null;
		}
		try {
			const dropdownContent = await Promise.all(
				albumList.map(async (album) => {
					const decipheredSymmetricalKey = await decrypt(
						keyPair.privateKey,
						Buffer.from(album.encryptionKey, "hex"),
					);
					const importedSymKey = await importSymmetricalKey(
						decipheredSymmetricalKey,
					);
					const decipheredAlbumName = await decryptFormValue(
						album.name,
						importedSymKey,
					);
					return { value: album.id, label: decipheredAlbumName };
				}),
			);

			setAlbumData(dropdownContent);
		} catch (e) {
			console.error(e);
			return null;
		}
	}, [albumList, userData]);

	useEffect(() => {
		void decipheredAlbumList();
	}, [decipheredAlbumList]);

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

		const newData: {
			newName?: string;
			newAlbum?: {
				id: string;
				key: string;
			} | null; // null means place outside of any album
		} = {};

		if (data.newName === name && selectedAlbumId === albumId) {
			// No change
			toast({
				title: "Error while updating image",
				description:
					"You need to change the name or the album to update the image.",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});

			return;
		}

		if (!data.newName) {
			toast({
				title: "Error while updating image",
				description: "The name of the image cannot be empty.",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});

			return;
		}

		// There is a change
		try {
			const decipheredImageSymKey = await decrypt(
				keyPair.privateKey,
				Buffer.from(image.encryptionKey, "hex"),
			);
			const importedImageSymKey = await importSymmetricalKey(
				decipheredImageSymKey,
			);
			if (data.newName && data.newName !== name) {
				// The image name is changed
				newData.newName = await encryptFormValue(
					data.newName,
					importedImageSymKey,
				);
			}

			if (selectedAlbumId !== albumId) {
				// The image is moved
				if (selectedAlbumId) {
					// The image is moved to an album
					const newAlbum = albumList?.find(
						(album) => album.id === selectedAlbumId,
					);
					if (!newAlbum) {
						throw new Error("The selected album does not exist.");
					}

					const decipheredAlbumSymKey = await decrypt(
						keyPair.privateKey,
						Buffer.from(newAlbum.encryptionKey, "hex"),
					);
					const importedAlbumSymKey = await importSymmetricalKey(
						decipheredAlbumSymKey,
					);
					const encryptedImageSymKey = await encrypt(
						importedAlbumSymKey,
						decipheredImageSymKey,
					);
					newData.newAlbum = {
						id: selectedAlbumId,
						key: encryptedImageSymKey,
					};
				} else {
					// The image is moved outside of any album
					newData.newAlbum = null;
				}
			}

			await imageUpdateMutation.mutateAsync({
				imageId: image.id,
				...newData,
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
						You can change the image&apos;s name and move it to another album
						here.
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
						<FormItem>
							<FormLabel>
								Album <span className="italic">(optional)</span>
							</FormLabel>{" "}
							<DropDownList
								selections={albumData}
								valueType="album"
								selectedValue={selectedAlbumId}
								setSelectedValue={setSelectedAlbumId}
							/>
						</FormItem>
						<DialogFooter className="pt-5">
							<Button type="submit">Update</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
