"use client";

import React from "react";

import type { UserDevice } from "@cryptalbum/app/profile/manageDevices/page";
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
import { api } from "@cryptalbum/trpc/react";
import UntrustedDevicesTableRow from "./UntrustedDevicesTableRow";

export default function UntrustedDevicesTable() {
	const untrustedDevicesQuery = api.auth.listUntrustedDevices.useQuery();

	const untrustedDevices: Array<UserDevice> | undefined =
		untrustedDevicesQuery.data;

	return (
		<Table>
			<TableCaption>A list of your new devices connexion request.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Device request id</TableHead>
					<TableHead className="text-right">Request date</TableHead>
					<TableHead className="text-center w-[200px]">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{untrustedDevices?.map((device) => (
					<UntrustedDevicesTableRow key={device.id} device={device} />
				))}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell colSpan={3} className="text-center">
						{untrustedDevicesQuery.isLoading ? "Loading..." : null}
						{untrustedDevicesQuery.isError
							? "An error occurred while fetching your devices"
							: null}
						{untrustedDevicesQuery.isSuccess && untrustedDevices?.length === 0
							? "No device request found."
							: null}
						{untrustedDevicesQuery.isSuccess &&
						untrustedDevices?.length &&
						untrustedDevices?.length > 0
							? `${untrustedDevices?.length} device request(s) found.`
							: null}
					</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	);
}
