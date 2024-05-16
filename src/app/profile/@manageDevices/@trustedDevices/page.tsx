"use client";

import TrustedDeviceTable from "./_components/TrustedDevicesTable";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";

import React from "react";

export default function ManageDevices() {
	return (
		<Card className="mx-auto max-w-max">
			<CardHeader>
				<CardTitle>Manage your trusted devices </CardTitle>
				<CardDescription>
					Here you can untrust your devices.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<TrustedDeviceTable />
			</CardContent>
		</Card>
	);
}
