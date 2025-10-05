import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { orderId } = await req.json();

  const serverKey = process.env.MIDTRANS_SERVER_KEY; // keep it secret in .env
  const auth = Buffer.from(serverKey + ":").toString("base64");

  try {
    const res = await fetch(`https://api.sandbox.midtrans.com/v2/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
