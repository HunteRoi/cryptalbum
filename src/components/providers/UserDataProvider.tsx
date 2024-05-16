"use client";

import {
	decrypt,
	decryptFormValue,
	importSymmetricalKey,
	loadKeyPair,
} from "@cryptalbum/crypto";

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

			const decipheredSymmetricalKey = await decrypt(
				keyPair.privateKey,
				Buffer.from(atob(symmetricalKey), "hex"),
			);

			const importedSymmetricalKey = (await importSymmetricalKey(
				decipheredSymmetricalKey,
			)) as CryptoKey;

			const decipheredValues = await Promise.all(
				Object.entries(encryptedValues).map(async ([key, value]) => {
					const decipheredValue = await decryptFormValue(
						value,
						importedSymmetricalKey,
					);
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
