import React from "react";
import { useForm } from "react-hook-form";

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
import { api } from "@cryptalbum/trpc/react";
import { signOut } from "next-auth/react";
import { Form } from "@cryptalbum/components/ui/form";

export default function DeleteAccountForm() {
	const deleteUserMutation = api.auth.deleteUser.useMutation();
	const form = useForm();

	async function deleteUser() {
		await deleteUserMutation.mutateAsync();
		await signOut({ callbackUrl: "/" });
	}
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="w-full bg-red-600 text-white">Delete account</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						Are you sure you want to delete your account ?
					</DialogTitle>
					<DialogDescription>
						You will be automatically logged out and your account will be
						deleted.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(deleteUser)}>
							<Button type="submit" className="w-full">
								I am sure, delete my account
							</Button>
						</form>
					</Form>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
