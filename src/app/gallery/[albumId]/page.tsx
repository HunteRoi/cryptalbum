"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import AlbumUpdateDialog from "@cryptalbum/app/gallery/_components/AlbumUpdateDialog";
import { UploadFileDialog } from "@cryptalbum/components/UploadFileDialog";
import { useUserData } from "@cryptalbum/components/providers/UserDataProvider";
import { Button } from "@cryptalbum/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import {
	decrypt,
	decryptFormValue,
	encrypt,
	importSymmetricalKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/utils/api";
import AlbumDeletionDialog from "../_components/AlbumDeletionDialog";
import AlbumSharingDialog from "../_components/AlbumSharingDialog";
import ImageCard from "../_components/ImageCard";

type AlbumState = {
	name: string;
	userId: string;
	description?: string;
	encryptionKey: string;
	images: Array<{
		id: string;
		name: string;
		encryptionKey: string;
		userId: string;
	}>;
};

export default function AlbumPage() {
	const searchParams = useParams();
	const albumId = searchParams.albumId as string;
	const userData = useUserData();
	const [albumState, setAlbumState] = useState<AlbumState | null>(null);
	const getAlbumQuery = api.album.getAlbum.useQuery(albumId);
	const { data: images } = api.image.getAlbumImages.useQuery(albumId);

	const router = useRouter();
	const whoAmIQuery = api.auth.whoami.useQuery();

	useEffect(() => {
		if (whoAmIQuery.error) {
			router.push("/auth/custom-logout");
		}
	}, [whoAmIQuery, router]);

	useEffect(() => {
		if (
			getAlbumQuery.isError &&
			getAlbumQuery.error?.data?.code === "NOT_FOUND"
		) {
			router.push("/gallery");
		}
	}, [getAlbumQuery]);

	const decipheredData = useCallback(async () => {
		const keyPair = await loadKeyPair();
		const { data: album } = getAlbumQuery;
		if (!userData || !album || !keyPair) {
			return null;
		}

		try {
			const decipheredAlbumSymmetricalKey = await decrypt(
				keyPair.privateKey,
				Buffer.from(album.encryptionKey, "hex"),
			);

			const albumSymmetricalKey = await importSymmetricalKey(
				decipheredAlbumSymmetricalKey,
			);
			const decipheredName = await decryptFormValue(
				album.name,
				albumSymmetricalKey,
			);
			let decipheredDescription = undefined;
			if (album.description) {
				decipheredDescription = await decryptFormValue(
					album.description,
					albumSymmetricalKey,
				);
			}

			const decipheredImages = await Promise.all(
				(images ?? []).map(async (image) => {
					const decipheredImageSymKey = await decrypt(
						albumSymmetricalKey,
						Buffer.from(image.encryptionKey, "hex"),
					);

					return {
						id: image.id,
						name: image.name,
						encryptionKey: await encrypt(
							keyPair.publicKey,
							decipheredImageSymKey,
						),
						userId: image.userId,
					};
				}),
			);

			setAlbumState({
				userId: album.userId,
				name: decipheredName,
				description: decipheredDescription,
				encryptionKey: album.encryptionKey,
				images: decipheredImages,
			});
		} catch (error) {
			console.error(JSON.stringify(error, null, 2));
		}
	}, [getAlbumQuery, images, userData]);

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
						{albumState?.description ??
							"Here is a list of all the images in this folder."}
					</CardDescription>
				</div>
				<div className="ml-auto flex flex-row items-center">
					{albumState && albumState.userId === userData?.userId && (
						<>
							<UploadFileDialog albumId={albumId} />
							<AlbumSharingDialog
								album={{
									id: albumId,
									name: albumState.name,
									encryptionKey: albumState.encryptionKey,
								}}
							/>{" "}
							<AlbumUpdateDialog
								album={{
									id: albumId,
									name: albumState.name,
									description: albumState.description,
									encryptionKey: albumState.encryptionKey,
								}}
							/>{" "}
							<AlbumDeletionDialog
								albumId={getAlbumQuery.data?.id}
								name={albumState.name}
							/>
						</>
					)}
				</div>
			</CardHeader>
			<CardContent className="flex flex-row flex-wrap">
				{albumState?.images.map((image) => (
					<ImageCard key={image.id} image={image} />
				))}
			</CardContent>
			{!images?.length && <CardFooter>No images found</CardFooter>}
		</Card>
	);
}
