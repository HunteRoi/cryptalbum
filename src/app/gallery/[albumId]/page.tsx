"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { api } from "@cryptalbum/trpc/react";
import { useUserData } from "@cryptalbum/components/providers/UserDataProvider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@cryptalbum/components/ui/card";
import { UploadFileDialog } from "@cryptalbum/components/UploadFileDialog";
import ImageCard from "../_components/ImageCard";
import { decrypt, decryptFormValue, importSymmetricalKey } from "@cryptalbum/crypto";
import { Button } from "@cryptalbum/components/ui/button";
import Link from "next/link";

type AlbumState = {
	name: string;
	description?: string;
	encryptionKey: string;
};

export default function AlbumPage() {
	const searchParams = useParams();
	const albumId = searchParams.albumId as string;
	const userData = useUserData();
	const [albumState, setAlbumState] = useState<AlbumState | null>(null);
	const { data: album } = api.album.getAlbum.useQuery(albumId);
	const { data: images } = api.image.getImagesAlbum.useQuery(albumId);

	const decipheredData = useCallback(async () => {
		if (!userData || !album) {
			return null;
		}

		try {
			const decipheredSymmetricalKey = await decrypt(
				userData.symmetricalKey,
				Buffer.from(album.encryptionKey, "hex"),
			);
			const importedSymmetricalKey = await importSymmetricalKey(
				decipheredSymmetricalKey,
			);
			const decipheredName = await decryptFormValue(
				album.name,
				importedSymmetricalKey,
			);
			let decipheredDescription = undefined;
			if (album.description) {
				decipheredDescription = await decryptFormValue(
					album.description,
					importedSymmetricalKey,
				);
			}
			
			setAlbumState({
				name: decipheredName,
				description: decipheredDescription,
				encryptionKey: decipheredSymmetricalKey,
			});
		} catch (error) {}
	}, [album, userData]);

	useEffect(() => {
		void decipheredData();
	}, [decipheredData]);

	return (
		<Card>
			<CardHeader className="space-y-0 flex flex-row items-center">
				<Button asChild size="sm" className="gap-1 mr-4">
					<Link href="/gallery">Go back</Link>
				</Button>
				<div className="grid gap-2">
					<CardTitle>{albumState?.name}</CardTitle>
					<CardDescription>
						{albumState?.description ?? "Here is a list of all the images in this folder."}
					</CardDescription>
				</div>
				<div className="ml-auto">
					<UploadFileDialog />
				</div>
			</CardHeader>
			<CardContent className="flex flex-row flex-wrap">
				{albumState && images?.map((image) => (
					image.encryptionKey = albumState.encryptionKey,
					<ImageCard key={image.id} image={image} />
				))}
			</CardContent>
			{!images?.length && <CardFooter>No images found</CardFooter>}
		</Card>
	);
}
