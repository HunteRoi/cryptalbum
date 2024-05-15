"use client";
import { Card, CardContent, CardFooter } from "@cryptalbum/components/ui/card";
import { api } from "@cryptalbum/trpc/react";
import ImageCard from "./ImageCard";

export default function ImageList() {
	const { data: images } = api.image.getImages.useQuery();

	return (
		<Card>
			{images && (
				<CardContent className="flex flex-row">
					{images?.map((image) => (
						<ImageCard key={image.id} image={image} />
					))}
				</CardContent>
			)}
			{!images?.length && <CardFooter>No images found</CardFooter>}
		</Card>
	);
}
