"use client";

import DeviceLinkingRequestForm from "@cryptalbum/app/auth/link/_components/DeviceLinkingRequestForm";
import RedirectionLink from "@cryptalbum/components/RedirectionLink";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";

export default function LinkDevice() {
	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle>Add a new device</CardTitle>
				<CardDescription>
					Link a new device to your account using your email
				</CardDescription>
			</CardHeader>
			<CardContent>
				<DeviceLinkingRequestForm />
				<RedirectionLink
					link={{ href: "/auth/login", text: "Login" }}
					contents="Already have an account?"
				/>
				<RedirectionLink
					link={{ href: "/auth/register", text: "Sign up" }}
					contents="Don't have an account?"
				/>
			</CardContent>
		</Card>
	);
}
