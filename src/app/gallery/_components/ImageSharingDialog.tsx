import { ExternalLink } from "lucide-react";
import { ToastAction } from "@radix-ui/react-toast";

import { Button } from "@cryptalbum/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@cryptalbum/components/ui/dialog";
import type { ImageInProps } from "./types";
import ImageSharingRequestForm from "./ImageSharingRequestForm";
import { toast } from "@cryptalbum/components/ui/use-toast";

type ImageSharingDialogProps = ImageInProps & { name?: string };
export default function ImageSharingDialog({ image, name }: ImageSharingDialogProps) {
	toast({
		title: "Image shared",
		description: "The image has been shared with the recipient",
		variant: "default",
		action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
	});

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
