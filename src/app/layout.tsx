import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { Navigation } from "@cryptalbum/components/Navigation";
import { AuthProvider } from "@cryptalbum/components/providers/AuthProvider";
import { ThemeProvider } from "@cryptalbum/components/providers/ThemeProvider";
import UserDataProvider from "@cryptalbum/components/providers/UserDataProvider";
import { Toaster } from "@cryptalbum/components/ui/toaster";
import { TRPCReactProvider } from "@cryptalbum/utils/api";

import "@cryptalbum/styles/globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata = {
	title: "Cryptalbum",
	description: "The best end-to-end encrypted photo gallery",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<html lang="fr">
			<body className={`font-sans ${inter.variable}`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider>
						<UserDataProvider>
							<Navigation />
							<Toaster />
							<TRPCReactProvider>{children}</TRPCReactProvider>
						</UserDataProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
