"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
	encrypt,
	encryptFileSymmetrical,
	encryptFormValue,
	exportSymmetricalKey,
	generateSymmetricalKey,
	importRsaPublicKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/trpc/react";
import { arrayBufferToHex, fileSchemaFront } from "@cryptalbum/utils/file";

import FileSkeleton from "./FileSkeleton";
import { ToastAction } from "./ui/toast";
import { useToast } from "./ui/use-toast";
import { useUserData, UserData } from "./providers/UserDataProvider";

const formSchema = z.object({
	file: fileSchemaFront,
	fileName: z.string(),
});

export default function FileUploadForm() {
	const { toast } = useToast();
	const userData = useUserData();

	const uploadMutation = api.image.upload.useMutation();

	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			file: null,
			fileName: "",
		},
	});

	const fileRef = form.register("file");

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		if (!userData) {
			toast({
				title: "Failed to upload file",
				description: "You need to be logged in to be able to upload files",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			return;
		}
		if (!data.file) {
			form.setError("file", {
				type: "manual",
				message: "File is required",
			});
			toast({
				title: "Failed to upload file",
				description: "File is required",
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			return;
		}
		try {
			const keyPair = await loadKeyPair();
			if (!keyPair) {
				toast({
					title: "Failed to upload file",
					description: "No key pair found",
					variant: "destructive",
					action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
				});
				return;
			}

			const cryptoKey = await generateSymmetricalKey();
			const encryptedFile = await encryptFileSymmetrical(data.file, cryptoKey);
			const fileData = arrayBufferToHex(encryptedFile);
			const exportedKey = await exportSymmetricalKey(cryptoKey);
			const encryptedKey = await encrypt(userData.symmetricalKey, exportedKey);
			const encryptedFileName = await encryptFormValue(
				data.fileName,
				cryptoKey,
				window.crypto.getRandomValues(new Uint8Array(12)),
			);
			const payload = {
				image: fileData,
				symmetricalKey: encryptedKey,
				imageName: encryptedFileName,
				requestDate: new Date(),
			};
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
		} catch (e) {
			console.error(e);
			toast({
				title: "Failed to upload file",
				description: "The server trolled us",
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
							{preview 
								? <img src={preview} alt="preview" height={240} width={360} lassName="mx-auto rounded-xl" />
								: <FileSkeleton />
							}
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="fileName"
					render={(input) => (
						<FormItem>
							<FormLabel>File name</FormLabel>
							<FormControl>
								<Input type="text" placeholder="My awesome picture" {...input}/>
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
