import { type NextRequest, NextResponse } from "next/server"
import { getOrder, markOrderConfirmed } from "@/lib/mock-db"

const HORIZON_MS = 6000

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const orderId = url.searchParams.get("orderId")
  if (!orderId) return new NextResponse("Missing orderId", { status: 400 })

  const order = getOrder(orderId)
  if (!order) return new NextResponse("Order not found", { status: 404 })

  const elapsed = Date.now() - order.createdAt
  if (order.status !== "confirmed" && elapsed >= HORIZON_MS) {
    markOrderConfirmed(orderId)
  }
  const updated = getOrder(orderId)!
  const secondsRemaining = Math.max(0, Math.ceil((HORIZON_MS - elapsed) / 1000))

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    secondsRemaining,
  })
}
