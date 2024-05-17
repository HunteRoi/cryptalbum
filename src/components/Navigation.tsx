"use client";
import Link from "next/link";
import * as React from "react";

import { useUserData } from "@cryptalbum/components/providers/UserDataProvider";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@cryptalbum/components/ui/navigation-menu";
import { CommandMenu } from "./CommandMenu";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function Navigation() {
	const userData = useUserData();

	return (
		<NavigationMenu className="mx-auto">
			<NavigationMenuList>
				<NavigationMenuItem>
					{userData && (
						<Link href="/gallery" className="font-bold">
							Welcome, {userData.name}
						</Link>
					)}
					<NavigationMenuLink href="/gallery" className="font-bold" />
				</NavigationMenuItem>
				<NavigationMenuItem>
					<Link href="/gallery" legacyBehavior passHref>
						<NavigationMenuLink className={navigationMenuTriggerStyle()}>
							Home
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>

				{userData && (
					<NavigationMenuItem>
						<Link href="/profile" legacyBehavior passHref>
							<NavigationMenuLink className={navigationMenuTriggerStyle()}>
								Profile
							</NavigationMenuLink>
						</Link>
					</NavigationMenuItem>
				)}

				<NavigationMenuItem>
					<div className="w-full flex-1 md:w-auto md:flex-none">
						<CommandMenu />
					</div>
				</NavigationMenuItem>
				{userData && (
					<NavigationMenuItem>
						<Button
							onClick={() => {
								void signOut({ callbackUrl: "/auth/login" });
							}}
						>
							<LogOut className="mr-2" />
							Sign out
						</Button>
					</NavigationMenuItem>
				)}
			</NavigationMenuList>
		</NavigationMenu>
	);
}
