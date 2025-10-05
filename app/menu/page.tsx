import { MenuItemCard } from "@/components/menu/menu-item-card"
import { listProducts, type Product } from "@/lib/mock-db"
import { FloatingCartWidget } from "@/components/menu/floating-cart-widget"
export const dynamic = "force-dynamic"

async function fetchExternalMenu(): Promise<Product[]> {
  const url = "https://salomohs.app.n8n.cloud/webhook/38d4eee1-d361-4882-acba-607c91ede421"
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data.map((raw: any) => {
      const name = raw.name ?? "Menu Item"
      const description = raw.desc ?? ""
      const price = raw.price ?? 0
      
      const imageData = raw.image ?? "/restaurant-menu-item.jpg"
      const categoryRaw = String(raw.category ?? "").toLowerCase()
      const category: Product["category"] = categoryRaw.includes("drink") ? "drink" : "food"
      const now = raw.created_at
      const id = raw.id
      return {
        id: id,
        name,
        description,
        price,
        imageData,
        category,
        createdAt: now,
      }
    })
  } catch {
    return []
  }
}

export default async function MenuPage() {
  const external = await listProducts()
  const products = [...external]
  const foods = products.filter((p) => p.category === "food")
  const drinks = products.filter((p) => p.category === "drink")

  return (
    <>
    <main className="mx-auto max-w-6xl p-6 space-y-10">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Food</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((p) => (
            <MenuItemCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Drinks</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {drinks.map((p) => (
            <MenuItemCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
    <FloatingCartWidget />
    </>
  )
}
