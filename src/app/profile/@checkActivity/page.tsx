"use client";

import React from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@cryptalbum/components/ui/card";
import UserActivityTable from "./_components/UserActivityTable";

export default function CheckActivityPage() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Activity</CardTitle>
				<CardDescription>Check your activity logs here</CardDescription>
			</CardHeader>
			<CardContent>
				<UserActivityTable />
			</CardContent>
		</Card>
	);
}
