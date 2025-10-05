"use client"

import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export function FloatingCartWidget() {
  const { items } = useCart()

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/cart">
        <Button size="lg" className="shadow-lg hover:cursor-pointer transition-shadow">
          <ShoppingCart className="mr-2 h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold">View Cart</span>
            <span className="text-xs opacity-90">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>
        </Button>
      </Link>
    </div>
  )
}
