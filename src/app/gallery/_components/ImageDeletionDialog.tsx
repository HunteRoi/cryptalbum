import {Trash2} from "lucide-react";

import {Button} from "@cryptalbum/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@cryptalbum/components/ui/dialog";
import {ToastAction} from "@cryptalbum/components/ui/toast";
import {useToast} from "@cryptalbum/components/ui/use-toast";
import {api} from "@cryptalbum/trpc/react";
import type {ImageInProps} from "./types";

type ImageDeletionDialogProps = ImageInProps & {
	name?: string;
};

export default function ImageDeletionDialog({
	image,
	name,
}: ImageDeletionDialogProps) {
	const { toast } = useToast();
	const pictureDeletionMutation = api.image.delete.useMutation();
	const trpcUtils = api.useUtils();

	const handleDelete = async () => {
		try {
			await pictureDeletionMutation.mutateAsync(image.id);

			toast({
				title: "Image deleted",
				description: `The image "${name}" has been deleted`,
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			await trpcUtils.image.getImages.invalidate();
			await trpcUtils.image.getAlbumImages.invalidate();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "An error occurred";

			toast({
				title: "Deletion error",
				description: message,
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
		}
	};

	return (
		<Dialog>
			<DialogTrigger>
				<Button title={`Delete image "${name}"`} className="bg-red-600">
					<Trash2 color="white" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Image</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete the image "{name}"? You won't be
						able to recover it afterwards.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={handleDelete}>Delete</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
