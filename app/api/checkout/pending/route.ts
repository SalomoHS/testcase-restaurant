import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const { orderId, items, price, status } = await req.json()
    try {
          await fetch(process.env.NEXT_PUBLIC_CHECKOUT_PENDING_URL || "", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderId,
              items: items,
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