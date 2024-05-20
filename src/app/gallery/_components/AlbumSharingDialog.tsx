import { ExternalLink } from "lucide-react";

import { Button } from "@cryptalbum/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@cryptalbum/components/ui/dialog";
import type { AlbumInProps } from "./types";
import GallerySharingRequestForm from "./AlbumSharingRequestForm";

export default function AlbumSharingDialog({ album }: AlbumInProps) {
	return (
		<Dialog>
			<DialogTrigger>
				<Button title={"Share album"}>
					<ExternalLink />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Share ${album.name}</DialogTitle>
					<DialogDescription>
						Share your album with someone else by typing their email address.
					</DialogDescription>
				</DialogHeader>
				<GallerySharingRequestForm album={album} />
			</DialogContent>
		</Dialog>
	);
}
