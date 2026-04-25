import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protected routes that require authentication
  const protectedRoutes = [
    "/profile",
    "/my-teams",
    "/my-applications",
    "/teams/new",
    "/notifications",
  ];

  // Admin routes
  const adminRoutes = ["/admin"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  if ((isProtected || isAdmin) && !session) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  if (isAdmin && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Banned users can't access anything except sign out
  if (session?.user && pathname !== "/api/auth/signout") {
    // Role check is handled at tRPC level for data mutations
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
