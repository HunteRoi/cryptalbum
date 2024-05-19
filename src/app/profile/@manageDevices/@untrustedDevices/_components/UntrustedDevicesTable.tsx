"use client";

import React from "react";
import UntrustedDevicesTableRow from "./UntrustedDevicesTableRow";

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

export type UserDevice = {
	id: string;
	publicKey: string;
	symmetricalKey: string | null;
	name: string | null;
	createdAt: Date;
};

export default function UntrustedDevicesTable() {
	const {
		data: untrustedDevices,
		isLoading,
		isError,
		isSuccess,
	} = api.auth.listUntrustedDevices.useQuery();

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
						{isLoading ? "Loading..." : null}
						{isError ? "An error occurred while fetching your devices" : null}
						{isSuccess && untrustedDevices?.length === 0
							? "No device request found."
							: null}
						{isSuccess &&
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
