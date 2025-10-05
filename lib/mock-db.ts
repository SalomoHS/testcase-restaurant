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

export async function createPendingOrder(items: OrderItem[]): Promise<Order> {
  seed()
  const id = `o_${Math.random().toString(36).slice(2, 10)}`
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  try {
    await fetch(process.env.NEXT_PUBLIC_CHECKOUT_PENDING_URL || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: id,
        items: items,
        price: total,
        status: "pending"
      }),
    })
  } catch (err) {
    console.error("Product add error:", (err as Error).message)
  }

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

export async function getOrder(id: string) {
  seed()
  const res = await fetch(process.env.NEXT_PUBLIC_GET_ORDER_URL || "", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: id,
    }),
  })
  
  if (!res.ok) throw new Error("Order not found")
  const data = await res.json()
  return data
}

export async function markOrderConfirmed(id: string) {
  seed()
  try {
    await fetch(process.env.NEXT_PUBLIC_CHECKOUT_SUCCESS_URL || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: id,
        status: "success"
      }),
    })
  } catch (err) {
    console.error("Product add error:", (err as Error).message)
  }

  const order = db.orders.find((o) => o.id === id)
  if (order) order.status = "confirmed"
  return order || null
}

export async function listOrders() {
  seed()
  const res = await fetch(process.env.NEXT_PUBLIC_GET_ORDER_URL || "", {
    headers: { "Content-Type": "application/json" },
  })
  
  if (!res.ok) throw new Error("Order not found")
  const data = await res.json()
  if (!Array.isArray(data)) return []

  // optional: convert fields if needed
  return data
    .map((o: any) => ({
      id: o.id,
      items: o.items,
      price: o.price,
      createdAt: new Date(o.created_at ?? Date.now()).getTime(),
    }))
    .sort((a, b) => b.createdAt - a.createdAt)

}
