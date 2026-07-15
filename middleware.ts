import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Coarse route-level gating. Fine-grained ownership checks (e.g. "can this
// user edit *this specific* request") happen in the API route handlers,
// since middleware can't cheaply query the database.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && role !== "COORDINATOR") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
