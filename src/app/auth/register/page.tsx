"use client";

import { Button } from "@cryptalbum/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
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
	encrypt,
	exportAsymmetricalKey,
	generateAsymmetricalKeyPair,
	loadKeyPair,
} from "@cryptalbum/crypto";
import { api } from "@cryptalbum/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
	deviceName: z.string().min(3, "Device name is too short"),
	name: z.string().min(3, "Name is too short"),
});

export default function Register() {
	const registerMutation = api.auth.createAccount.useMutation();
	const router = useRouter();
	const { toast } = useToast();

	async function checkKeyPair() {
		const keyPair = await loadKeyPair();
		if (keyPair) {
			console.info("You already have a key pair stored. Please sign in.");
			void router.push("/auth/login");
		}
	}

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			name: "",
			deviceName: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const keyPair = await generateAsymmetricalKeyPair();
		const publicKey = await exportAsymmetricalKey(keyPair.publicKey);
		try {
			const [encryptedName, encryptedDeviceName] = await Promise.all([
				encrypt(keyPair.publicKey, values.name),
				encrypt(keyPair.publicKey, values.deviceName),
			]);

			await registerMutation.mutateAsync({
				email: values.email,
				name: encryptedName,
				deviceName: encryptedDeviceName,
				publicKey,
			});

			console.log("Account created successfully");
			toast({
				title: "Account created successfully",
				description: "You can now log in with your new account",
			});

			void router.push("/auth/login");
		} catch (error) {
			console.error("An error occurred. Please try again.");
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
	useEffect(() => {
		void checkKeyPair();
	}, []);

	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Register</CardTitle>
				<CardDescription>
					Enter your email and name below to register your account
				</CardDescription>
			</CardHeader>
			<CardContent>
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
										<Input placeholder="m@example.com" {...field} />
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
										<Input placeholder="Macbook 2024" {...field} />
									</FormControl>
									<FormDescription>
										This is for your convenience to identify your device.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Submit</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
