"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

import ImageDeletionDialog from "@cryptalbum/app/gallery/_components/ImageDeletionDialog";
import ImageUpdateDialog from "@cryptalbum/app/gallery/_components/ImageUpdateDialog";
import { useUserData } from "@cryptalbum/components/providers/UserDataProvider";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import {
	decrypt,
	decryptFileSymmetrical,
	decryptFormValue,
	importSymmetricalKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/utils/api";
import ImageSharingDialog from "./ImageSharingDialog";
import type { ImageInProps } from "./types";

type ImageCardState = {
	name: string;
	path: string;
};

type ImageCardProps = ImageInProps & {
	albumId?: string;
};

export default function ImageCard({ image, albumId }: ImageCardProps) {
	const [imageState, setImageState] = useState<ImageCardState | null>(null);
	const userData = useUserData();
	const { data: encryptedImageContent } = api.image.getImageContent.useQuery({
		imageId: image.id,
		albumId,
	});

	const decipheredData = useCallback(async () => {
		const keyPair = await loadKeyPair();
		if (!userData || !encryptedImageContent || !keyPair) {
			return null;
		}

		try {
			const decipheredSymmetricalKey = await decrypt(
				keyPair.privateKey,
				Buffer.from(image.encryptionKey, "hex"),
			);
			const importedSymmetricalKey = await importSymmetricalKey(
				decipheredSymmetricalKey,
			);
			const decipheredImage = await decryptFileSymmetrical(
				Buffer.from(encryptedImageContent, "hex"),
				importedSymmetricalKey,
			);
			const decipheredName = await decryptFormValue(
				image.name,
				importedSymmetricalKey,
			);

			setImageState({
				name: decipheredName,
				path: `data:image/png;base64,${Buffer.from(decipheredImage).toString(
					"base64",
				)}`,
			});
		} catch (error) {
			// ignore error
		}
	}, [encryptedImageContent, image, userData]);

	useEffect(() => {
		if (encryptedImageContent) {
			void decipheredData();
		}
	}, [encryptedImageContent, decipheredData]);

	return (
		<Card className="w-full max-w-sm m-2 py-2 basis-1/5 grow">
			<CardContent className="aspect-w-4 aspect-h-5 relative">
				{imageState && (
					<Image
						alt={imageState.name}
						className="object-cover rounded-t-lg"
						height={500}
						src={imageState.path}
						style={{
							aspectRatio: "400/500",
							objectFit: "cover",
						}}
						width={400}
					/>
				)}
			</CardContent>
			<CardHeader className="grid gap-1 p-4">
				<CardTitle>{imageState?.name}</CardTitle>
				{image.userId === userData?.userId && (
					<CardDescription>
						<ImageUpdateDialog image={image} name={imageState?.name} />{" "}
						{!albumId && (
							<>
								<ImageSharingDialog
									image={image}
									name={imageState?.name}
								/>{" "}
							</>
						)}
						<ImageDeletionDialog image={image} name={imageState?.name} />
					</CardDescription>
				)}
			</CardHeader>
		</Card>
	);
}
