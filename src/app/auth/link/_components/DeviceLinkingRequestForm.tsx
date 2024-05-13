"use client";

import { Button } from "@cryptalbum/components/ui/button";
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
import { toast } from "@cryptalbum/components/ui/use-toast";
import {
	exportAsymmetricalKey,
	generateAsymmetricalKeyPair,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/trpc/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export default function DeviceLinkingRequestForm() {
	const router = useRouter();
	const linkDeviceMutation = api.auth.createDevice.useMutation();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const keyPair =
			(await loadKeyPair()) ?? (await generateAsymmetricalKeyPair());

		const { email } = values;
		const publicKey = keyPair.publicKey;

		const deviceId = await linkDeviceMutation.mutateAsync({
			email,
			publicKey: await exportAsymmetricalKey(publicKey),
		});

		toast({
			title: "Device linked",
			description: `A new device linking request has been created for ${email} with ID ${deviceId}`,
			duration: 0,
		});

		router.push("/auth/login");
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input {...field} placeholder="me@example.com" />
							</FormControl>
							<FormDescription>
								The email address associated with your account
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full">
					Send linking request
				</Button>
			</form>
		</Form>
	);
}
