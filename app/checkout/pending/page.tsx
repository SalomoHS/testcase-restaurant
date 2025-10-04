"use client"

import * as React from "react"
import useSWR from "swr"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCart } from "@/lib/cart"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PendingPage() {
  const params = useSearchParams()
  const orderId = params.get("orderId")
  const method = params.get("method") || "bca_va"
  const va = params.get("va") || ""
  const router = useRouter()
  const { clear } = useCart()

  const didComplete = React.useRef(false)

  const { data } = useSWR(orderId ? `/api/payment-status?orderId=${encodeURIComponent(orderId)}` : null, fetcher, {
    refreshInterval: 1500,
    isPaused: () => didComplete.current,
    revalidateOnFocus: false,
  })

  React.useEffect(() => {
    if (!didComplete.current && data?.status === "confirmed" && orderId) {
      didComplete.current = true
      clear()
      router.replace(`/checkout/success?orderId=${encodeURIComponent(orderId)}`)
    }
  }, [data?.status, orderId, router, clear])

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-balance">Waiting for payment</h1>
        <p className="text-muted-foreground">
          {"We're processing your payment."}{" "}
          {data?.secondsRemaining ? `About ${data.secondsRemaining}s remaining...` : ""}
        </p>
      </header>

      <section className="rounded-md border p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-block h-5 w-5 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin"
          />
          <div className="font-medium">Status: {data?.status ?? "pending"}</div>
        </div>

        {method === "bca_va" && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">BCA Virtual Account</div>
            <div className="rounded-md bg-muted px-3 py-2 font-mono text-sm select-all">{va || "3901XXXXXXXXX"}</div>
            <p className="text-sm text-muted-foreground">
              Pay using the Virtual Account number above. This is a demo; your order will auto-confirm in a few seconds.
            </p>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/menu">Back to menu</Link>
        </Button>
        <Button variant="secondary" onClick={() => orderId && router.refresh()} aria-label="Refresh status">
          Refresh
        </Button>
      </div>
    </main>
  )
}
