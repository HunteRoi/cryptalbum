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
import ImageSharingRequestForm from "./ImageSharingRequestForm";
import type { ImageInProps } from "./types";

type ImageSharingDialogProps = ImageInProps & { name?: string };
export default function ImageSharingDialog({
	image,
	name,
}: ImageSharingDialogProps) {
	return (
		<Dialog>
			<DialogTrigger>
				<Button title={"Share image"}>
					<ExternalLink />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Share {name}</DialogTitle>
					<DialogDescription>
						Share your picture with someone else by typing their email address.
					</DialogDescription>
				</DialogHeader>
				<ImageSharingRequestForm image={image} />
			</DialogContent>
		</Dialog>
	);
}
