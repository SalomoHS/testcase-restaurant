import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-pretty">Welcome to Our Restaurant</h1>
          <p className="text-muted-foreground">
            Explore our menu of delicious food and refreshing drinks. Place your order and enjoy a quick checkout.
          </p>
          <div className="flex gap-3">
            <Link href="/menu">
              <Button>Browse Menu</Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline">Admin</Button>
            </Link>
          </div>
        </div>
        <div>
          <img src="/images/design-mode/restaurant-table-with-dishes.jpg" alt="Restaurant" className="w-full rounded-lg border" />
        </div>
      </section>
    </main>
  )
}
