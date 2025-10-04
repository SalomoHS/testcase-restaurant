"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CartIndicator } from "@/components/cart/cart-indicator"
import { usePathname } from "next/navigation"
import useSWR from "swr"

export function SiteHeader() {
  const pathname = usePathname()
  const showCart = pathname?.startsWith("/menu")

  const { data, isLoading } = useSWR("/api/admin/me", (url: string) =>
    fetch(url, { credentials: "same-origin", cache: "no-store" }).then((r) => r.json()),
  )
  const isAdmin = data?.isAdmin

  return (
    <header className="w-full border-b bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          Restaurant
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/menu" className="px-3 py-2 rounded-md hover:bg-accent">
            Menu
          </Link>
          {showCart ? (
            <Link href="/cart" className="px-3 py-2 rounded-md hover:bg-accent flex items-center">
              <span>Cart</span>
              <CartIndicator />
            </Link>
          ) : null}
          {isLoading ? null : isAdmin ? (
            pathname === "/admin/dashboard" ? (
              <form action="/api/admin/logout" method="post">
                <Button size="sm" variant="secondary" type="submit">
                  Sign out
                </Button>
              </form>
            ) : (
              <Link href="/admin/dashboard">
                <Button size="sm" variant="default">
                  Admin
                </Button>
              </Link>
            )
          ) : (
            <Link href="/admin/dashboard">
              <Button size="sm" variant="default">
                Admin
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
