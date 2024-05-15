"use client";

import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@cryptalbum/components/ui/card";

import UploadFile from "@cryptalbum/components/UploadFile";

export default function UploadPage() {
	return (
		<Card className="mx-auto max-w-max">
			<CardHeader>
				<CardTitle>Upload a new image</CardTitle>
				<CardDescription>Here you can upload a new image.</CardDescription>
			</CardHeader>
			<CardContent>
				<UploadFile />
			</CardContent>
		</Card>
	);
}
