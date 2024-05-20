import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	function middleware(req) {
		if (!req.nextauth?.token) {
			return NextResponse.redirect("/auth/signin");
		}

		if (req.url === "/") {
			return NextResponse.redirect("/gallery");
		}
	},
	{
		callbacks: {
			authorized: ({ token }) => !!token, // user is authorized if token is present
		},
	},
);

export const config = {
	// pages that require authentication
	matcher: ["/", "/gallery", "/profile"],
};
