"use client";

import { Button } from "@cryptalbum/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@cryptalbum/components/ui/dialog";
import FileUploadForm from "./UploadFile";
import { ScrollArea } from "./ui/scroll-area";

type UploadFileDialogProps = {
	albumId?: string;
};

export function UploadFileDialog({ albumId }: UploadFileDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm" className="ml-auto gap-1">
					Upload file
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] h-[700px]">
				<ScrollArea className="h-100 w-100">
					<DialogHeader>
						<DialogTitle>Upload file</DialogTitle>
						<DialogDescription>
							Add a new pictures to your gallery
						</DialogDescription>
					</DialogHeader>
					<FileUploadForm albumId={albumId} />
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
