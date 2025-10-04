"use client"

import * as React from "react"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function CartPage() {
  const { items, total, setQuantity, removeItem, clear } = useCart()
  const router = useRouter()
  const [method, setMethod] = React.useState<"bca_va">("bca_va")
  React.useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js"
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

    const script = document.createElement('script')
    script.src = snapScript
    script.setAttribute('data-client-key', clientKey || "")
    script.async = true

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }

  }, [])  
  async function checkout(pm: "bca_va" = "bca_va") {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, paymentMethod: pm }),
      })
      console.log(res)
      
      if (!res.ok) throw new Error("Checkout failed")
      const data = await res.json()
      window.snap.pay(data.token)
      // const orderId = data?.order?.id
      // const va = data?.payment?.vaNumber
      // if (!orderId) throw new Error("No order id")
      // router.push(
      //   `/checkout/pending?orderId=${encodeURIComponent(orderId)}&method=${encodeURIComponent(pm)}${
      //     va ? `&va=${encodeURIComponent(va)}` : ""
      //   }`,
      // )
    } catch (e) {
      console.error("[v0] Checkout error:", (e as Error).message)
      alert("Checkout failed")
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Cart</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y rounded-md border">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-4 p-4">
                <img src={i.imageData || "/placeholder.svg"} alt={i.name} className="h-16 w-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm text-muted-foreground">Rp{i.price}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(i.productId, Math.max(1, i.quantity - 1))}
                    disabled={i.quantity <= 1}
                    className="h-8 w-8"
                  >
                    -
                  </Button>
                  <input
                    aria-label="Quantity"
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) => setQuantity(i.productId, Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded border bg-background px-2 py-1 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(i.productId, i.quantity + 1)}
                    className="h-8 w-8"
                  >
                    +
                  </Button>
                  <Button variant="ghost" onClick={() => removeItem(i.productId)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Total: Rp{total}</div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Proceed to checkout</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Choose payment method</DialogTitle>
                  <DialogDescription>
                    {"Select a payment method to continue."} {`Items: ${items.length}, Total: Rp${total}`}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <RadioGroup value={method} onValueChange={(v) => setMethod(v as "bca_va")}>
                    <div className="flex items-center gap-3 rounded-md border p-3">
                      <RadioGroupItem id="bca_va" value="bca_va" aria-label="BCA Virtual Account" />
                      <Label htmlFor="bca_va" className="cursor-pointer">
                        BCA Virtual Account
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={() => checkout(method)}>Confirm & Continue</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </main>
  )
}
