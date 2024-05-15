import { UploadFileDialog } from "@cryptalbum/components/UploadFileDialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import ImageList from "./_components/ImageList";

export default function GalleryPage() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center">
				<div className="grid gap-2">
					<CardTitle>Gallery</CardTitle>
					<CardDescription>
						Here is a list of all the images you have uploaded.
					</CardDescription>
				</div>
				<UploadFileDialog />
			</CardHeader>
			<CardContent>
				<ImageList />
			</CardContent>
		</Card>
	);
}
