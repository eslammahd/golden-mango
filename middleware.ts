import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/dashboard and future admin sub-routes
  if (pathname.startsWith("/admin/dashboard")) {
    const session = req.cookies.get("admin_session");
    if (!session?.value) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
