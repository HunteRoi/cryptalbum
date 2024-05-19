"use client";

import React from "react";

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@cryptalbum/components/ui/table";
import {api} from "@cryptalbum/trpc/react";
import TrustedDevicesTableRow from "./TrustedDevicesTableRow";

export type UserDevice = {
	id: string;
	publicKey: string;
	symmetricalKey: string | null;
	name: string | null;
	lastLogin: Date | null;
};

export default function TrustedDevicesTable() {
	const {
		data: trustedDevices,
		isLoading,
		isError,
		isSuccess,
	} = api.auth.listTrustedDevices.useQuery();

	return (
		<Table>
			<TableCaption>A list of your trusted devices.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Device name</TableHead>
					<TableHead className="text-right">Last login date</TableHead>
					<TableHead className="text-center w-[200px]">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{trustedDevices?.map((device) => (
					<TrustedDevicesTableRow key={device.id} device={device} />
				))}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell colSpan={3} className="text-center">
						{isLoading ? "Loading..." : null}
						{isError ? "An error occurred while fetching your devices" : null}
						{isSuccess && trustedDevices?.length === 0
							? "No device request found."
							: null}
						{isSuccess && trustedDevices?.length && trustedDevices?.length > 0
							? `${trustedDevices?.length} device(s) found.`
							: null}
					</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	);
}
