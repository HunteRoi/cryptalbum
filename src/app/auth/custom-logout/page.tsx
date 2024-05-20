"use client";

import { deleteSession } from "@cryptalbum/utils/session";
import { useEffect } from "react";

export default function CustomLogoutPage() {
	useEffect(() => {
		void deleteSession();
	}, []);

	return <></>;
}
