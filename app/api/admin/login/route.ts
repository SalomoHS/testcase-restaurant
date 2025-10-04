import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminCookieName } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  if (username === "admin" && password === "admin") {
    cookies().set(getAdminCookieName(), "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    })
    return NextResponse.json({ ok: true })
  }
  return new NextResponse("Unauthorized", { status: 401 })
}
