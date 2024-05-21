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
import AlbumSharingRequestForm from "./AlbumSharingRequestForm";
import type { AlbumInProps } from "./types";

export default function AlbumSharingDialog({ album }: AlbumInProps) {
	return (
		<Dialog>
			<DialogTrigger>
				<Button title={"Share album"} className="ml-2">
					<ExternalLink />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Share {album.name}</DialogTitle>
					<DialogDescription>
						Share your album with someone else by typing their email address.
					</DialogDescription>
				</DialogHeader>
				<AlbumSharingRequestForm album={album} />
			</DialogContent>
		</Dialog>
	);
}
