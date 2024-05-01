"use client";

import { decrypt, loadKeyPair } from "@cryptalbum/crypto";

import { useSession } from "next-auth/react";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type UserData = {
	id: string;
	email: string;
	name: string;
	deviceName: string;
};

const UserDataContext = createContext<UserData | null>(null);

export function useUserData() {
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
			const { id, email, ...encryptedValues } = session.user;

			const decipheredValues = await Promise.all(
				Object.entries(encryptedValues).map(async ([key, value]) => {
					const decipheredValue = await decrypt(
						keyPair.privateKey,
						Buffer.from(value, "hex"),
					);
					// biome-ignore lint/style/noNonNullAssertion: We know that the value will be a string as we are decrypting it from the pubkey-encrypted value
					return [key, decipheredValue!.toString()];
				}),
			);

			setUserData({
				id,
				email,
				name: decipheredValues.find(([key]) => key === "name")?.[1] ?? "",
				deviceName:
					decipheredValues.find(([key]) => key === "deviceName")?.[1] ?? "",
			});
		}
	}, [session]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		void decipherSession();
	}, [session]);

	return (
		<UserDataContext.Provider value={userData}>
			{children}
		</UserDataContext.Provider>
	);
}
