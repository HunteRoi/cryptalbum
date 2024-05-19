"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import UntrustedDevicesTable from "./_components/UntrustedDevicesTable";

import React from "react";

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
