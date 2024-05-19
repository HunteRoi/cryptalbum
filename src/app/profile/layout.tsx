import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import type { PropsWithChildren, ReactNode } from "react";

type ProfileLayoutProps = PropsWithChildren<{
	manageDevices: ReactNode;
	manageAccount: ReactNode;
	checkActivity: ReactNode;
}>;

export default function ProfileLayout({
	children,
	manageDevices,
	manageAccount,
	checkActivity,
}: ProfileLayoutProps) {
	return (
		<main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
			<div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
				<Card className="lg:col-span-3">
					<CardHeader>
						<CardTitle>Profile</CardTitle>
						<CardDescription>Manage your account settings</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4 ">
						{children}
						{manageAccount}
						{manageDevices}
						{checkActivity}
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
