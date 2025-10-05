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
async function fetchMenu(): Promise<Product[]> {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_FETCH_PRODUCT_URL || "")
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
async function seed() {
  if (db.seeded) return
  const now = Date.now()
  const external = await fetchMenu()
  const starter = [...external]
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
