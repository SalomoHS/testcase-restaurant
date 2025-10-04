export type Product = {
  id: string
  name: string
  description: string
  price: number // cents
  imageData: string // data URL (base64) or placeholder URL
  category: "food" | "drink"
  createdAt: number
}

export type OrderItem = {
  productId: string
  name: string
  price: number // cents at time of order
  quantity: number
}

export type Order = {
  id: string
  items: OrderItem[]
  total: number // cents
  status: "pending" | "confirmed"
  createdAt: number
}

type DB = {
  products: Product[]
  orders: Order[]
  seeded: boolean
}

const globalAny = globalThis as any
if (!globalAny.__MOCK_DB__) {
  globalAny.__MOCK_DB__ = { products: [], orders: [], seeded: false } as DB
}
const db: DB = globalAny.__MOCK_DB__
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
async function seed() {
  if (db.seeded) return
  const now = Date.now()
  const external = await fetchExternalMenu()
  const starter = [...external]
  // const starter: Product[] = [
  //   {
  //     id: "p1",
  //     name: "Margherita Pizza",
  //     description: "Classic pizza with tomato, mozzarella, and basil.",
  //     price: 1299,
  //     imageData: "/margherita-pizza-on-wooden-board.jpg",
  //     category: "food",
  //     createdAt: now,
  //   },
  //   {
  //     id: "p2",
  //     name: "Caesar Salad",
  //     description: "Romaine, parmesan, croutons, and Caesar dressing.",
  //     price: 999,
  //     imageData: "/caesar-salad-in-bowl.jpg",
  //     category: "food",
  //     createdAt: now,
  //   },
  //   {
  //     id: "p3",
  //     name: "Iced Latte",
  //     description: "Chilled espresso with milk over ice.",
  //     price: 499,
  //     imageData: "/iced-latte-in-glass.jpg",
  //     category: "drink",
  //     createdAt: now,
  //   },
  //   {
  //     id: "p4",
  //     name: "Sparkling Water",
  //     description: "Refreshing, chilled, lightly carbonated.",
  //     price: 299,
  //     imageData: "/bottle-of-sparkling-water.jpg",
  //     category: "drink",
  //     createdAt: now,
  //   },
  // ]
  db.products.push(...starter)
  db.seeded = true
}

export async function listProducts() {
  await seed()
  // newest first
  return [...db.products].sort((a, b) => b.createdAt - a.createdAt)
}

export function addProduct(p: Omit<Product, "id" | "createdAt">): Product {
  seed()
  const id = `p_${Math.random().toString(36).slice(2, 9)}`
  const product: Product = { ...p, id, createdAt: Date.now() }
  db.products.unshift(product)
  return product
}

export function findProduct(id: string) {
  seed()
  return db.products.find((p) => p.id === id) || null
}

export function createOrder(items: OrderItem[]): Order {
  seed()
  const id = `o_${Math.random().toString(36).slice(2, 10)}`
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const order: Order = {
    id,
    items,
    total,
    status: "confirmed", // mock payment confirms immediately
    createdAt: Date.now(),
  }
  db.orders.unshift(order)
  return order
}

export function createPendingOrder(items: OrderItem[]): Order {
  seed()
  const id = `o_${Math.random().toString(36).slice(2, 10)}`
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const order: Order = {
    id,
    items,
    total,
    status: "pending",
    createdAt: Date.now(),
  }
  db.orders.unshift(order)
  return order
}

export function getOrder(id: string) {
  seed()
  return db.orders.find((o) => o.id === id) || null
}

export function markOrderConfirmed(id: string) {
  seed()
  const order = db.orders.find((o) => o.id === id)
  if (order) order.status = "confirmed"
  return order || null
}

export function listOrders() {
  seed()
  return [...db.orders].sort((a, b) => b.createdAt - a.createdAt)
}
