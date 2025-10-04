import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Check if admin cookie exists
    const adminCookie = request.cookies.get("demo_admin")

    if (!adminCookie || adminCookie.value !== "1") {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
