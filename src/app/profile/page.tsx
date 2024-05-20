"use client";

import { api } from "@cryptalbum/utils/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
	const router = useRouter();
	const whoAmIQuery = api.auth.whoami.useQuery();

	useEffect(() => {
		if (whoAmIQuery.error) {
			router.push("/auth/custom-logout");
		}
	}, [whoAmIQuery]);

	return <></>;
}
