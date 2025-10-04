import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminCookieName } from "@/lib/auth"

export async function POST() {
  cookies().delete(getAdminCookieName())
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_URL))
}
