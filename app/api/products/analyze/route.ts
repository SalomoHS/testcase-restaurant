import { type NextRequest, NextResponse } from "next/server"
import { addProduct, listProducts } from "@/lib/mock-db"
import { isAdminFromCookies } from "@/lib/auth"

export const dynamic = "force-dynamic"
export async function POST(req: NextRequest) {
  console.log(req)
  const fd = await req.formData()
  const res = await fetch(process.env.NEXT_PUBLIC_ANALYZE_PRODUCT_URL || "", {
        method: "POST",
        body: fd,
      })
  const data = await res.json()
  return NextResponse.json({ data }, { status: 201 })
}
