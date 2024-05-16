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

export function Navigation() {
	const userData = useUserData();

	return (
		<NavigationMenu className="mx-auto">
			<NavigationMenuList>
				<NavigationMenuItem>
					{userData && (
						<Link href="/" className="font-bold">
							Welcome, {userData.name}
						</Link>
					)}
					<NavigationMenuLink href="/" className="font-bold" />
				</NavigationMenuItem>
				<NavigationMenuItem>
					<Link href="/" legacyBehavior passHref>
						<NavigationMenuLink className={navigationMenuTriggerStyle()}>
							Home
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
				<NavigationMenuItem>
					{userData ? (
						<Link href="/gallery" legacyBehavior passHref>
							<NavigationMenuLink className={navigationMenuTriggerStyle()}>
								Gallery
							</NavigationMenuLink>
						</Link>
					) : (
						<></>
					)}
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
			</NavigationMenuList>
		</NavigationMenu>
	);
}
