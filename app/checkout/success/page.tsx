import { getOrder } from "@/lib/mock-db"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams.orderId
  if (!orderId) redirect("/menu")
  const order = await getOrder(orderId)
  if (!order) redirect("/menu")
  
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Order Confirmed</h1>
      <p className="text-muted-foreground">
        Thank you! Your order <span className="font-mono">{order.id}</span> is confirmed.
      </p>
      <div className="rounded-md border">
        <ul className="divide-y">
          {JSON.parse(order.items).map((i: any, idx:any) => (
            <li key={idx} className="flex items-center justify-between p-3">
              <div>
                {i.name} × {i.quantity}
              </div>
              <div>Rp{i.price * i.quantity}</div>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between p-3 font-medium">
          <div>Total</div>
          <div>Rp{order.price}</div>
        </div>
      </div>
      <div className="pt-2">
        <Button className="cursor-pointer" asChild>
          <Link href="/menu">Back to menu</Link>
        </Button>
      </div>
    </main>
  )
}
