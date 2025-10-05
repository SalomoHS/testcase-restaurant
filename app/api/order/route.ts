import { type NextRequest, NextResponse } from "next/server"
import { getOrder, markOrderConfirmed } from "@/lib/mock-db"
export async function POST(req: NextRequest) {
    const { orderId, description, price, status } = await req.json()
    try {
          await fetch(process.env.NEXT_PUBLIC_ADD_PRODUCT_URL || "", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderId,
              description: description,
              price: price,
              status: status
            }),
          })
          return NextResponse.json({
                "message": "success",
            }, {status: 200})
        } catch (err) {
          console.error("Product add error:", (err as Error).message)
          return NextResponse.json({
                "message": "error",
            }, {status: 400})
        }
    
}