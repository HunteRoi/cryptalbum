import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@cryptalbum/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@cryptalbum/components/ui/dialog";
import { ToastAction } from "@cryptalbum/components/ui/toast";
import { useToast } from "@cryptalbum/components/ui/use-toast";
import { api } from "@cryptalbum/utils/api";

type AlbumDeletionDialogProps = {
	albumId?: string;
	name?: string;
};

export default function AlbumDeletionDialog({
	albumId,
	name,
}: AlbumDeletionDialogProps) {
	const { toast } = useToast();
	const albumDeletionMutation = api.album.deleteAlbum.useMutation();
	const getAlbumsQuery = api.album.getAlbums.useQuery();
	const router = useRouter();

	const handleDelete = async () => {
		if (!albumId) {
			return;
		}

		try {
			await albumDeletionMutation.mutateAsync(albumId);
			await getAlbumsQuery.refetch();
			toast({
				title: "Album deleted",
				description: `The album "${name}" has been deleted.`,
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
			router.push("/gallery");
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
				<Button className="bg-red-600 ml-2">
					<Trash2 color="white" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Album</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete the album &quot;{name}&quot;? You
						won&apos;t be able to recover it afterwards.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={handleDelete} className="bg-red-600">
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
