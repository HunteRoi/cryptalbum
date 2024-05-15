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

export function UploadFileDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm" className="ml-auto gap-1">
					Upload file
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Upload file</DialogTitle>
					<DialogDescription>
						Add a new pictures to your gallery
					</DialogDescription>
				</DialogHeader>
				<FileUploadForm />
			</DialogContent>
		</Dialog>
	);
}
