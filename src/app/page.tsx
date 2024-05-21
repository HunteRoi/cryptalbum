"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useUserData } from "@cryptalbum/components/providers/UserDataProvider";
import { api } from "@cryptalbum/utils/api";

export default function Home() {
	const userData = useUserData();
	const router = useRouter();

	const whoAmIQuery = api.auth.whoami.useQuery();

	useEffect(() => {
		if (whoAmIQuery.error) {
			router.push("/auth/custom-logout");
		}
	}, [whoAmIQuery, router]);

	useEffect(() => {
		if (userData) {
			router.push("/gallery");
		} else {
			router.push("/auth/login");
		}
	}, [userData, router]);

	return <></>;
}
