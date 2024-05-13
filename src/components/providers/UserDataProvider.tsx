"use client";

import { decrypt, importSymmetricalKey, loadKeyPair } from "@cryptalbum/crypto";

import { useSession } from "next-auth/react";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

export type UserData = {
	id: string;
	email: string;
	name: string;
	deviceName: string;
	symmetricalKey: CryptoKey;
};

const UserDataContext = createContext<UserData | null>(null);

export function useUserData(): UserData | null {
	return useContext(UserDataContext);
}

export default function UserDataProvider({
	children,
}: { children: ReactNode }) {
	const { data: session } = useSession();
	const [userData, setUserData] = useState<UserData | null>(null);

	const decipherSession = useCallback(async () => {
		const keyPair = await loadKeyPair();

		if (keyPair && session) {
			const { id, email, symmetricalKey, ...encryptedValues } = session.user;

			const decipheredSymmetricalKey = (await decrypt(
				keyPair.privateKey,
				Buffer.from(atob(symmetricalKey), "hex"),
			)) as string;

			const importedSymmetricalKey = (await importSymmetricalKey(
				decipheredSymmetricalKey,
			)) as CryptoKey;

			const decipheredValues = await Promise.all(
				Object.entries(encryptedValues).map(async ([key, base64Value]) => {
					const value = atob(base64Value);
					const iv = new Uint8Array(
						Array.from(value.slice(0, 12)).map((ch) => ch.charCodeAt(0)),
					);
					const decipheredValue = (await decrypt(
						importedSymmetricalKey,
						Buffer.from(value.slice(12), "hex"),
						iv,
					)) as string;
					return [key, decipheredValue];
				}),
			);

			setUserData({
				id,
				email,
				name: decipheredValues.find(([key]) => key === "name")?.[1] ?? "",
				deviceName:
					decipheredValues.find(([key]) => key === "deviceName")?.[1] ?? "",
				symmetricalKey: importedSymmetricalKey,
			});
		}
	}, [session]);

	useEffect(() => {
		void decipherSession();
	}, [decipherSession]);

	return (
		<UserDataContext.Provider value={userData}>
			{children}
		</UserDataContext.Provider>
	);
}
