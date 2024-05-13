"use client";

import UntrustedDevicesTable from "@cryptalbum/app/profile/manageDevices/_components/UntrustedDevicesTable";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";

import React from "react";

export type UserDevice = {
	id: string;
	userId: string;
	publicKey: string;
	symmetricalKey: string | null;
	name: string | null;
	lastLogin: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

export default function ManageDevices() {
	return (
		<Card className="mx-auto max-w-max">
			<CardHeader>
				<CardTitle>Manage new devices connexion requests</CardTitle>
				<CardDescription>
					Here you can accept or reject new devices connexion requests.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<UntrustedDevicesTable />
			</CardContent>
		</Card>
	);
}
