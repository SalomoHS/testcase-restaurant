export type Product = {
  id: string
  name: string
  description: string
  price: number 
  imageData: string 
  category: "food" | "drink"
  createdAt: number
}

export type OrderItem = {
  productId: string
  name: string
  price: number 
  quantity: number
}

export type Order = {
  id: string
  items: OrderItem[]
  total: number 
  status: "pending" | "confirmed"
  createdAt: number
}

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

export async function listProducts() {
  const menus = await fetchMenu()
  return [...menus].sort((a, b) => b.createdAt - a.createdAt)
}

export async function createPendingOrder(items: OrderItem[]): Promise<Order> {
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

  return order
}

export async function getOrder(id: string) {
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
  return
}