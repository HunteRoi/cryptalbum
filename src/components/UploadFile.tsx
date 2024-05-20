"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@cryptalbum/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@cryptalbum/components/ui/form";
import { Input } from "@cryptalbum/components/ui/input";
import {
	decrypt,
	decryptFormValue,
	encrypt,
	encryptFileSymmetrical,
	encryptFormValue,
	exportSymmetricalKey,
	generateSymmetricalKey,
	importRsaPublicKey,
	importSymmetricalKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/utils/api";
import { arrayBufferToHex, fileSchemaFront } from "@cryptalbum/utils/file";
import Image from "next/image";
import DropDownList from "./DropDownList";
import FileSkeleton from "./FileSkeleton";
import { useUserData } from "./providers/UserDataProvider";
import { ToastAction } from "./ui/toast";
import { useToast } from "./ui/use-toast";

const formSchema = z.object({
	file: fileSchemaFront,
	fileName: z.string(),
});

type FileUploadFormProps = {
	albumId?: string;
};

export default function FileUploadForm({ albumId }: FileUploadFormProps) {
	const { toast } = useToast();
	const userData = useUserData();
	const router = useRouter();
	const uploadMutation = api.image.upload.useMutation();
	const trpcUtils = api.useUtils();
	const { data: albumList } = api.album.getAlbums.useQuery();
	const { data: userDevices } = api.auth.listTrustedDevices.useQuery();
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [albumData, setAlbumData] = useState<
		Array<{ value: string; label: string }>
	>([]);
	const [selectedAlbumId, setSelectedAlbumId] = React.useState(albumId ?? "");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			file: null,
			fileName: "",
		},
	});

	const fileRef = form.register("file");

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
				title: "Failed to upload file",
				description: "You need to be logged in to be able to upload files",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			router.push("/auth/login");
			return;
		}
		if (!data.file) {
			form.setError("file", {
				type: "manual",
				message: "The file is required or invalid",
			});
			toast({
				title: "Failed to upload file",
				description: "File is required",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			return;
		}

		if (!data.fileName) {
			form.setError("fileName", {
				type: "manual",
				message: "File name is required",
			});
			toast({
				title: "Failed to upload file",
				description: "File name is required",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			return;
		}

		try {
			const cryptoKey = await generateSymmetricalKey();
			const encryptedFile = await encryptFileSymmetrical(data.file, cryptoKey);

			const exportedKey = await exportSymmetricalKey(cryptoKey);
			const [encryptedFileName, ...symmetricalKeysWithDevice] =
				await Promise.all([
					encryptFormValue(data.fileName, cryptoKey),
					...(userDevices ?? []).map(async (device) => {
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

			const payload: {
				image: string;
				symmetricalKeysWithDevice: {
					symmetricalKey: string;
					deviceId: string;
				}[];
				imageName: string;
				requestDate: Date;
				album?: { id: string; symmetricalKey: string };
			} = {
				image: arrayBufferToHex(encryptedFile),
				symmetricalKeysWithDevice,
				imageName: encryptedFileName,
				requestDate: new Date(),
			};

			const album = albumList?.find((album) => album.id === selectedAlbumId);

			if (album) {
				const decipheredAlbumSymKey = await decrypt(
					keyPair.privateKey,
					Buffer.from(album.encryptionKey, "hex"),
				);
				const importedSymKey = await importSymmetricalKey(
					decipheredAlbumSymKey,
				);
				const exportedPictureSymKey = await exportSymmetricalKey(cryptoKey);
				const encryptedImageSymKey = await encrypt(
					importedSymKey,
					exportedPictureSymKey,
				);

				payload.album = { id: album.id, symmetricalKey: encryptedImageSymKey };
			}

			await uploadMutation.mutateAsync({
				metadata: {
					requestSize: JSON.stringify(payload).length,
				},
				payload,
			});
			setFile(null);
			form.reset();
			toast({
				title: "File uploaded",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			if (albumId) {
				await trpcUtils.image.getAlbumImages.invalidate();
			} else {
				await trpcUtils.image.getImages.invalidate();
			}
		} catch (e) {
			console.error(e);
			toast({
				title: "Failed to upload file",
				description: "An error occurred while uploading the file",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
		}
	};

	useEffect(() => {
		if (!file) {
			setPreview(null);
			return;
		}

		setPreview(URL.createObjectURL(file));
	}, [file]);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto p-10">
				<FormField
					control={form.control}
					name="file"
					render={() => (
						<FormItem>
							<FormLabel>File</FormLabel>
							<FormControl>
								<Input
									type="file"
									placeholder="shadcn"
									{...fileRef}
									onChange={(e) => setFile(e.target.files?.item(0) ?? null)}
								/>
							</FormControl>
							{preview ? (
								<Image
									src={preview}
									alt="preview"
									height={240}
									width={360}
									className="mx-auto rounded-xl"
								/>
							) : (
								<FileSkeleton />
							)}
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="fileName"
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
				<div className="flex pt-4">
					<Button type="submit" className="mx-auto">
						Submit
					</Button>
				</div>
			</form>
		</Form>
	);
}
