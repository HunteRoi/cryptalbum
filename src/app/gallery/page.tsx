"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { UploadFileDialog } from "@cryptalbum/components/UploadFileDialog";
import CreateAlbumDialog from "@cryptalbum/components/CreateAlbumDialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import Gallery from "./_components/Gallery";
import { useUserData } from "@cryptalbum/components/providers/UserDataProvider";


export default function GalleryPage() {

	const userData = useUserData();
	const router = useRouter();

	useEffect(() => {
		if(!userData){
			router.push("/auth/login")
		}
	},[userData, router]);

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
					<CreateAlbumDialog/>
					<UploadFileDialog />
				</div>
			</CardHeader>
			<CardContent className="flex flex-row flex-wrap">
				<Gallery/>
			</CardContent>
		</Card>
	);
}
