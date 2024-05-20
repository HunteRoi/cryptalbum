import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
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
import { useToast } from "@cryptalbum/components/ui/use-toast";
import {
	encryptFormValue,
	exportAsymmetricalKey,
	exportSymmetricalKey,
	generateAsymmetricalKeyPair,
	generateSymmetricalKey,
	loadKeyPair,
	storeKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/utils/api";

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
	deviceName: z.string().min(3, "Device name is too short"),
	name: z.string().min(3, "Name is too short"),
});

export default function RegistrationForm() {
	const registerMutation = api.auth.createAccount.useMutation();
	const router = useRouter();
	const { toast } = useToast();

	const checkKeyPair = useCallback(async () => {
		const keyPair = await loadKeyPair();
		if (keyPair) {
			toast({
				title: "You already have an account",
				description: "You can't create another account with the same device",
			});
			router.push("/auth/login");
		}
	}, [router, toast]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			name: "",
			deviceName: "",
		},
	});

	const onSubmit = useCallback(
		async (values: z.infer<typeof formSchema>) => {
			const keyPair = await generateAsymmetricalKeyPair();
			const publicKey = await exportAsymmetricalKey(keyPair.publicKey);
			const symmetricalKey = await generateSymmetricalKey();

			try {
				const [encryptedName, encryptedDeviceName, encryptedSymmetricalKey] =
					await Promise.all([
						encryptFormValue(values.name, symmetricalKey),
						encryptFormValue(values.deviceName, symmetricalKey),
						encryptFormValue(
							await exportSymmetricalKey(symmetricalKey),
							keyPair.publicKey,
						),
					]);

				await registerMutation.mutateAsync({
					email: values.email,
					name: encryptedName,
					deviceName: encryptedDeviceName,
					publicKey,
					symmetricalKey: encryptedSymmetricalKey,
				});

				toast({
					title: "Account created successfully",
					description: "You can now log in with your new account",
				});

				await storeKeyPair(keyPair);

				router.push("/auth/login");
			} catch (error) {
				console.error("An error occurred. Please try again.", error);
			}
		},
		[registerMutation, router, toast],
	);

	useEffect(() => {
		void checkKeyPair();
	}, [checkKeyPair]);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="John" {...field} />
							</FormControl>
							<FormDescription>
								This is your public display name.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>email</FormLabel>
							<FormControl>
								<Input placeholder="me@example.com" {...field} />
							</FormControl>
							<FormDescription>
								This is your public display name.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="deviceName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Device name</FormLabel>
							<FormControl>
								<Input placeholder="MacBook Pro M1 Pro 2021" {...field} />
							</FormControl>
							<FormDescription>A name to identify your device.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full">
					Submit
				</Button>
			</form>
		</Form>
	);
}
