import { type NextRequest, NextResponse } from "next/server"
import { addProduct, listProducts } from "@/lib/mock-db"
import { isAdminFromCookies } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ products: listProducts() })
}

export async function POST(req: NextRequest) {
  if (!isAdminFromCookies()) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  const body = await req.json()
  const { name, description, price, imageData, category } = body || {}
  if (!name || !description || typeof price !== "number" || !imageData || !category) {
    return new NextResponse("Invalid payload", { status: 400 })
  }
  const product = addProduct({
    name,
    description,
    price,
    imageData,
    category,
  })
  return NextResponse.json({ product }, { status: 201 })
}
