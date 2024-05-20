"use client";

import CreateAlbumDialog from "@cryptalbum/components/CreateAlbumDialog";
import { UploadFileDialog } from "@cryptalbum/components/UploadFileDialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import { api } from "@cryptalbum/utils/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Gallery from "./_components/Gallery";

export default function GalleryPage() {
	const router = useRouter();
	const whoAmIQuery = api.auth.whoami.useQuery();

	useEffect(() => {
		if (whoAmIQuery.error) {
			router.push("/auth/custom-logout");
		}
	}, [whoAmIQuery]);

	return (
		<Card>
			<CardHeader className="space-y-0 flex flex-row items-center">
				<div className="grid gap-2">
					<CardTitle>Gallery</CardTitle>
					<CardDescription>
						Here is a list of all the images you have uploaded.
					</CardDescription>
				</div>
				<div className="ml-auto">
					<CreateAlbumDialog />
					<UploadFileDialog />
				</div>
			</CardHeader>
			<CardContent className="flex flex-row flex-wrap">
				<Gallery />
			</CardContent>
		</Card>
	);
}
