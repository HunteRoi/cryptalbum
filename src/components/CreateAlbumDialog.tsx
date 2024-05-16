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
import CreateAlbumForm from "./CreateAlbumForm";

export default function CreateAlbumDialog() {
    return(
        <Dialog>
			<DialogTrigger asChild>
				<Button size="sm" className="mx-2 gap-1">
					Create album
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create album</DialogTitle>
					<DialogDescription>
						Create a new album to organize your images
					</DialogDescription>
				</DialogHeader>
				<CreateAlbumForm/>
			</DialogContent>
		</Dialog>
    );
};
