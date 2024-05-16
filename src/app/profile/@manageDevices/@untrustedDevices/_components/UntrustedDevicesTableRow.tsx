"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Ban, Check } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
	type UserData,
	useUserData,
} from "@cryptalbum/components/providers/UserDataProvider";
import { Button } from "@cryptalbum/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@cryptalbum/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@cryptalbum/components/ui/form";
import { Input } from "@cryptalbum/components/ui/input";
import { TableCell, TableRow } from "@cryptalbum/components/ui/table";
import {
	encrypt,
	encryptFormValue,
	exportSymmetricalKey,
	importRsaPublicKey,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/trpc/react";
import type { UserDevice } from "./UntrustedDevicesTable";

type UntrustedDevicesTableRowProps = {
	device: UserDevice;
};

const formSchema = z.object({
	friendlyName: z.string().min(1),
});

export default function UntrustedDevicesTableRow({
	device,
}: UntrustedDevicesTableRowProps) {
	const userData = useUserData() as UserData;

	const trustedDevicesQuery = api.auth.listTrustedDevices.useQuery();
	const untrustedDevicesQuery = api.auth.listUntrustedDevices.useQuery();
	const trustDeviceMutation = api.auth.trustDevice.useMutation();
	const deleteDeviceMutation = api.auth.deleteDevice.useMutation();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			friendlyName: "",
		},
	});

	async function acceptDevice(values: z.infer<typeof formSchema>) {
		const { friendlyName } = values;
		const { symmetricalKey } = userData;

		const publicKey = await importRsaPublicKey(device.publicKey);
		const encryptedSymmetricalKey = await encryptFormValue(
			await exportSymmetricalKey(symmetricalKey),
			publicKey,
		);

		const encryptedValue = await encryptFormValue(friendlyName, symmetricalKey);

		await trustDeviceMutation.mutateAsync({
			deviceId: device.id,
			symmetricalKey: encryptedSymmetricalKey,
			deviceName: encryptedValue,
		});
		await untrustedDevicesQuery.refetch();
		await trustedDevicesQuery.refetch();
	}

	async function rejectDevice(deviceId: string) {
		await deleteDeviceMutation.mutateAsync({ deviceId });
		await untrustedDevicesQuery.refetch();
	}

	return (
		<TableRow key={device.id}>
			<TableCell className="font-medium">{device.id}</TableCell>
			<TableCell className="text-right">
				{device.createdAt.toISOString()}
			</TableCell>
			<TableCell className="text-center">
				<Button
					onClick={() => rejectDevice(device.id)}
					title={`Reject ${device.id}`}
					className="bg-red-600"
				>
					<Ban color="white"/>
				</Button>{" "}
				<Dialog>
					<DialogTrigger asChild>
						<Button title={`Accept ${device.id}`} className="bg-green-600">
							<Check color="white"/>
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Accept {device.id}</DialogTitle>
							<DialogDescription>
								In order to accept this device connexion request, please fill in
								its friendly name.
							</DialogDescription>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(acceptDevice)}>
								<FormField
									control={form.control}
									name="friendlyName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Device name</FormLabel>
											<FormControl>
												<Input placeholder="MacBook Air" {...field} />
											</FormControl>
											<FormDescription>
												This is the name of the device you are about to trust.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button type="submit">Accept</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</TableCell>
		</TableRow>
	);
}
