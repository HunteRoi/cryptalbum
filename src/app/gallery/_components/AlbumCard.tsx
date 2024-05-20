"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CardStackIcon } from "@radix-ui/react-icons";
import Link from "next/link";

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
	decryptFormValue,
	importSymmetricalKey,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { useRouter } from "next/navigation";
import { toast } from "@cryptalbum/components/ui/use-toast";
import { signOut } from "next-auth/react";

type AlbumCardProps = {
	album: {
		id: string;
		name: string;
		description: string | null;
		encryptionKey: string;
	};
};

type AlbumCardState = {
	name: string;
	description?: string;
};

export default function AlbumCard({ album }: AlbumCardProps) {
	const [albumState, setAlbumState] = useState<AlbumCardState | null>(null);
	const userData = useUserData();

	const decipheredData = useCallback(async () => {
		const keyPair = await loadKeyPair();
		if (!userData || !keyPair) {
			return;
		}

		try {
			const decipheredSymmetricalKey = await decrypt(
				keyPair.privateKey,
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
			});
		} catch (error) {
			toast({
				title: "Decryption error",
				description: "An error occurred while decrypting the album data.",
				variant: "destructive",
			});
		}
	}, [album, userData]);

	useEffect(() => {
		void decipheredData();
	}, [decipheredData]);

	return (
		<Link href={`/gallery/${album.id}`} className="basis-1/5 grow flex">
			<Card className="flex flex-col m-2 p-2 justify-center items-center grow">
				<CardContent className="w-full p-0 flex items-center justify-center">
					<CardStackIcon className="w-[150px] h-[150px]" />
				</CardContent>
				<CardHeader className="w-full min-h-24 grid gap-1 p-4">
					<CardTitle>{albumState?.name}</CardTitle>
					<CardDescription>{albumState?.description}</CardDescription>
				</CardHeader>
			</Card>
		</Link>
	);
}
