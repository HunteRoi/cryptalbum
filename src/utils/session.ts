import { deleteAllCookies } from "@cryptalbum/utils/cookies";
import { signOut } from "next-auth/react";

export async function deleteSession() {
	deleteAllCookies();
	localStorage.clear();
	sessionStorage.clear();

	await signOut({ callbackUrl: "/auth/login" });
}
