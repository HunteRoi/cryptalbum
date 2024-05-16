"use client";

import React from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import DeleteAccountForm from "./_components/DeleteAccountForm";

export default function DeleteAccountPage() {
	return (
		<Card className="mx-auto my-auto">
			<CardHeader>
				<CardTitle>Account management</CardTitle>
				<CardDescription>
					Here you can delete your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<DeleteAccountForm />
			</CardContent>
		</Card>
	);
}