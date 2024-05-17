"use client";

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
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/trpc/react";
import type { ImageInProps } from "./types";

type ImageCardState = {
	name: string;
	path: string;
};

export default function ImageCard({ image }: ImageInProps) {
	const [imageState, setImageState] = useState<ImageCardState | null>(null);
	const userData = useUserData();
	const { data: encryptedImageContent } = api.image.getImageContent.useQuery(
		image.id,
	);

	const decipheredData = useCallback(async () => {
		if (!userData || !encryptedImageContent) {
			return null;
		}

		try {
			const decipheredSymmetricalKey = await decrypt(
				userData.symmetricalKey,
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
		} catch (error) {}
	}, [encryptedImageContent, image, userData]);

	useEffect(() => {
		if (encryptedImageContent) {
			void decipheredData();
		}
	}, [encryptedImageContent, decipheredData]);

	return (
		<Card className="w-full max-w-sm m-2">
			<CardContent className="aspect-w-4 aspect-h-5 relative">
				<img
					alt={imageState?.name}
					className="object-cover rounded-t-lg"
					height={500}
					src={imageState?.path}
					style={{
						aspectRatio: "400/500",
						objectFit: "cover",
					}}
					width={400}
				/>
			</CardContent>
			<CardHeader className="grid gap-1 p-4">
				<CardTitle>{imageState?.name}</CardTitle>
				<CardDescription>
					<ImageDeletionDialog image={image} name={imageState?.name} />{" "}
					<ImageUpdateDialog image={image} name={imageState?.name} />
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
