"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
	storeKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/utils/api";
import { ToastAction } from "@cryptalbum/components/ui/toast";

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
		try {
			const keyPair =
				(await loadKeyPair()) ?? (await generateAsymmetricalKeyPair());

			const { email } = values;
			const publicKey = keyPair.publicKey;

			const deviceId = await linkDeviceMutation.mutateAsync({
				email,
				publicKey: await exportAsymmetricalKey(publicKey),
			});

			toast({
				title: "Device request sent",
				description: `A new device linking request has been created for ${email} with ID ${deviceId}. Go to the login page to connect to your account once it is accepted.`,
				action: (
					<Button
						onClick={() => router.push("/auth/login")}
						variant="secondary"
					>
						Go to login
					</Button>
				),
			});

			await storeKeyPair(keyPair);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "An error occurred while sending the request.";

			toast({
				title: "Request error",
				description: message,
				variant: "destructive",
				action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			});
		}
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
