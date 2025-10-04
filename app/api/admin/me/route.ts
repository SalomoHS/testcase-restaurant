import { NextResponse } from "next/server"
import { isAdminFromCookies } from "@/lib/auth"

export async function GET() {
  return NextResponse.json({ isAdmin: isAdminFromCookies() })
}
