"use client"

import * as React from "react"

const CART_KEY = "cart-v1"

function readCartCount(): number {
  if (typeof window === "undefined") return 0
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return 0
    const data = JSON.parse(raw)
    if (Array.isArray(data?.items)) {
      return data.items.reduce((sum: number, item: any) => {
        const qty = typeof item?.quantity === "number" ? item.quantity : 1
        return sum + qty
      }, 0)
    }
    return 0
  } catch {
    return 0
  }
}

export function CartIndicator({ className }: { className?: string }) {
  const [count, setCount] = React.useState<number>(0)

  React.useEffect(() => {
    const update = () =>
      React.startTransition(() => {
        setCount(readCartCount())
      })
    update()

    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) update()
    }
    const onCartUpdated = () => update()

    window.addEventListener("storage", onStorage)
    window.addEventListener("cart:updated", onCartUpdated as EventListener)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("cart:updated", onCartUpdated as EventListener)
    }
  }, [])

  if (count <= 0) return null

  return (
    <span
      className={`ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground ${className || ""}`}
      aria-label={`Cart has ${count} item${count === 1 ? "" : "s"}`}
    >
      {count}
    </span>
  )
}
