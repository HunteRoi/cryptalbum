"use client";

import { CardFooter } from "@cryptalbum/components/ui/card";
import { api } from "@cryptalbum/utils/api";
import AlbumCard from "./AlbumCard";
import ImageCard from "./ImageCard";

export default function Gallery() {
	const { data: albums } = api.album.getAlbums.useQuery();
	const { data: images } = api.image.getImages.useQuery();

	return (
		<div className="flex flex-row flex-wrap justify-center">
			{albums?.map((album) => (
				<AlbumCard key={album.id} album={album} />
			))}
			{images?.map((image) => (
				<ImageCard key={image.id} image={image} />
			))}
			{!images?.length && !albums?.length && (
				<CardFooter>No images found</CardFooter>
			)}
		</div>
	);
}
