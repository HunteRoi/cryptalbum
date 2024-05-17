"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUserData } from "@cryptalbum/components/providers/UserDataProvider";

export default function Home() {
	const userData = useUserData();
	const router = useRouter();

	useEffect(() => {
		if(userData){
			router.push("/gallery")
		}
		else{
			router.push("/auth/login")
		}
	},[userData, router]);

	return (
		<></>
	);
}
