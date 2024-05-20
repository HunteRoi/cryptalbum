"use client";

import RedirectionLink from "@cryptalbum/components/RedirectionLink";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";

import { LoginForm } from "@cryptalbum/app/auth/login/_components/LoginForm";
import { Suspense } from "react";

export default function Login() {
	return (
		<div className="w-full h-screen flex items-center justify-center px-4">
			<Card className="mx-auto max-w-sm">
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense>
						<LoginForm />
					</Suspense>
					<RedirectionLink
						link={{ href: "/auth/register", text: "Sign up" }}
						contents="Don't have an account?"
					/>
					<RedirectionLink
						link={{ href: "/auth/link", text: "Create a linking request" }}
						contents="New device?"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
