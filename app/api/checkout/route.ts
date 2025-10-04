import { type NextRequest, NextResponse } from "next/server"
import { createPendingOrder } from "@/lib/mock-db"
import Midtrans from "midtrans-client"

// let core = new Midtrans.CoreApi({
//         isProduction : false,
//         serverKey : process.env.MIDTRANS_SERVER_KEY,
//         clientKey : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
//     });

let snap = new Midtrans.Snap({
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY,
        clientKey : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    });  

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { items, paymentMethod } = body || {}
  if (!Array.isArray(items) || items.length === 0) {
    return new NextResponse("No items", { status: 400 })
  }
  // let parameter = {
  //           "payment_type": "gopay",
  //           "transaction_details": {
  //               "gross_amount": 20000,
  //               "order_id": ~~(Math.random() * 100)+1,
  //           }
  //       };

  let parameter = {
    "transaction_details": {
        "order_id": ~~(Math.random() * 100)+1,
        "gross_amount": 10000 * 2
    },
    "item_details": [{
        "name": "Test Item",
        "price": 10000,
        "quantity": 1
    },{
        "name": "Test Item 2",
        "price": 10000,
        "quantity": 1
    }]
};

//     // charge transaction
//     // const chargeResponse = await core.charge(parameter)
//     // console.log(chargeResponse);
   
  const token = await snap.createTransaction(parameter)
  console.log(token);

  const order = createPendingOrder(items)
  const method = paymentMethod || "bca_va"
  const vaNumber = `3901${Math.floor(100000000 + Math.random() * 900000000)}`
  return NextResponse.json({
    token: token.token
  })
}
