"use client";

import React, {useEffect} from "react";
import {Trash2} from "lucide-react";

import {Button} from "@cryptalbum/components/ui/button";
import {TableCell, TableRow} from "@cryptalbum/components/ui/table";
import {api} from "@cryptalbum/trpc/react";
import type {UserDevice} from "./TrustedDevicesTable";
import {decryptFormValue} from "@cryptalbum/crypto";
import {useUserData} from "@cryptalbum/components/providers/UserDataProvider";

type TustedDevicesTableRowProps = {
	device: UserDevice;
};

export default function TrustedDevicesTableRow({
	device,
}: TustedDevicesTableRowProps) {
	const trustedDevicesQuery = api.auth.listTrustedDevices.useQuery();
	const deleteDeviceMutation = api.auth.deleteDevice.useMutation();
	const [deviceName, setDeviceName] = React.useState<string | null>(null);
	const userData = useUserData();

	async function deleteDevice(deviceId: string) {
		await deleteDeviceMutation.mutateAsync({ deviceId });
		await trustedDevicesQuery.refetch();
	}

	async function decryptDeviceName(name: string | null) {
		if (!userData?.symmetricalKey) {
			return;
		}

		if (!name) {
			return;
		}

		try {
			const decryptedName = await decryptFormValue(
				name,
				userData?.symmetricalKey,
			);

			setDeviceName(decryptedName);
		} catch (error) {
			return;
		}
	}

	useEffect(() => {
		void decryptDeviceName(device.name);
	}, [decryptDeviceName, device.name]);

	return (
		<TableRow key={device.id}>
			<TableCell className="font-medium">{deviceName}</TableCell>
			<TableCell className="text-right">
				{device.lastLogin?.toISOString() ?? "Has not logged in yet."}
			</TableCell>
			<TableCell className="text-center">
				{userData?.id !== device.id ? (
					<Button
						onClick={() => deleteDevice(device.id)}
						title={`Delete ${device.id}`}
						className="bg-red-600"
					>
						<Trash2 color="white"/>
					</Button>
				): <p>You can't delete current device.</p>}
			</TableCell>
		</TableRow>
	);
}
