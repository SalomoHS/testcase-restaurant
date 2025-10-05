import { type NextRequest, NextResponse } from "next/server"
import { createPendingOrder } from "@/lib/mock-db"
import Midtrans from "midtrans-client"

let snap = new Midtrans.Snap({
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY,
        clientKey : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    });  

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { items } = body || {}
  if (!Array.isArray(items) || items.length === 0) {
    return new NextResponse("No items", { status: 400 })
  }

  const order = createPendingOrder(items)
  let parameter = {
    "transaction_details": {
        "order_id": order.id,
        "gross_amount": items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    },
    "item_details": items.map((i) => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity,
        }))
};

   
  const token = await snap.createTransaction(parameter)
  console.log(token);

  return NextResponse.json({
    token: token.token, order_id: order.id
  })
}
