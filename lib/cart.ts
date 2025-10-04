"use client"

import { useEffect, useMemo, useState } from "react"

export type CartItem = {
  productId: string
  name: string
  price: number 
  imageData: string
  quantity: number
}

type CartState = {
  items: CartItem[]
}

const KEY = "cart-v1"

function read(): CartState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { items: [] }
    return JSON.parse(raw)
  } catch {
    return { items: [] }
  }
}

function write(state: CartState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

function isEqualCart(a: CartState, b: CartState) {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

export function useCart() {
  const [state, setState] = useState<CartState>(() => read())

  useEffect(() => {
    const sync = () => {
      const latest = read()
      setState((prev) => (isEqualCart(prev, latest) ? prev : latest))
    }
    window.addEventListener("storage", sync)
    window.addEventListener("cart:updated", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("cart:updated", sync)
    }
  }, [])

  useEffect(() => {
    try {
      write(state)
    } catch {}
    if (typeof window !== "undefined") {
      setTimeout(() => window.dispatchEvent(new Event("cart:updated")), 0)
    }
  }, [state])

  const total = useMemo(() => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0), [state.items])

  function addItem(item: Omit<CartItem, "quantity">, qty = 1) {
    setState((prev) => {
      const exist = prev.items.find((i) => i.productId === item.productId)
      return exist
        ? {
            items: prev.items.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i)),
          }
        : { items: [...prev.items, { ...item, quantity: qty }] }
    })
  }

  function setQuantity(productId: string, qty: number) {
    setState((prev) => ({
      items: prev.items
        .map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
        .filter((i) => i.quantity > 0),
    }))
  }

  function removeItem(productId: string) {
    setState((prev) => ({ items: prev.items.filter((i) => i.productId !== productId) }))
  }

  function clear() {
    setState({ items: [] })
  }

  return { items: state.items, total, addItem, setQuantity, removeItem, clear }
}
