"use client";

import { useUserData } from "@cryptalbum/components/providers/UserDataProvider";

export function UserShowcase() {
	const userData = useUserData();

	if (!userData) {
		return null;
	}

	return (
		<div className="w-full max-w-xs">
			<h1 className="text-2xl font-bold">Create Post</h1>
			<p>Welcome to Cryptalbum on {userData.deviceName}</p>
		</div>
	);
}
