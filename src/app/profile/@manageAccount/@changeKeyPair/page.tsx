"use client";

import React from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import ChangeKeyPairForm from "./_components/ChangeKeyPairForm";

export default function ChangeKeyPairPage() {
	return (
		<Card className="mx-auto my-auto">
			<CardHeader>
				<CardTitle>Device key pair</CardTitle>
				<CardDescription>
					Here you can ask to change current device&apos;s key pair
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChangeKeyPairForm />
			</CardContent>
		</Card>
	);
}
