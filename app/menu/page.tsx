import { MenuItemCard } from "@/components/menu/menu-item-card"
import { listProducts, type Product } from "@/lib/mock-db"

export const dynamic = "force-dynamic"

async function fetchExternalMenu(): Promise<Product[]> {
  const url = "https://salomohs.app.n8n.cloud/webhook/38d4eee1-d361-4882-acba-607c91ede421"
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []

    const now = Date.now()
    return data.map((raw: any, idx: number) => {
      const name = raw.name ?? raw.title ?? "Menu Item"
      const description = raw.description ?? raw.desc ?? ""
      // Try to read price in cents or dollars; convert dollars -> cents
      const price = raw.price ?? 0
      
      const imageData = raw.image ?? raw.imageUrl ?? raw.photo ?? "/restaurant-menu-item.jpg"
      const categoryRaw = String(raw.category ?? raw.type ?? "").toLowerCase()
      const category: Product["category"] = categoryRaw.includes("drink") ? "drink" : "food"

      return {
        id: `ext_${idx}_${Math.random().toString(36).slice(2, 7)}`,
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
  const external = await fetchExternalMenu()
  const products = [...external]

  const foods = products.filter((p) => p.category === "food")
  const drinks = products.filter((p) => p.category === "drink")

  return (
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
  )
}
