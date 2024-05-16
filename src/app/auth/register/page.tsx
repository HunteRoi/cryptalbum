"use client";

import RedirectionLink from "@cryptalbum/components/RedirectionLink";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";

import RegistrationForm from "@cryptalbum/app/auth/register/_components/RegistrationForm";

export default function Register() {
	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle>Register</CardTitle>
				<CardDescription>
					Enter your email and name below to register your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<RegistrationForm />
				<RedirectionLink
					link={{ href: "/auth/login", text: "Login" }}
					contents="Already have an account?"
				/>
				<RedirectionLink
					link={{ href: "/auth/link", text: "Create a linking request" }}
					contents="New device?"
				/>
			</CardContent>
		</Card>
	);
}
