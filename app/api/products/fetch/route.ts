import { type NextRequest, NextResponse } from "next/server"
import { addProduct } from "@/lib/mock-db"
import { isAdminFromCookies } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_FETCH_PRODUCT_URL || "")
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return NextResponse.json({ data }, { status: 200 })
  } catch {
    return []
  }
}
