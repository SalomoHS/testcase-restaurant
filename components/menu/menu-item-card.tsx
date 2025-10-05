"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/cart"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/mock-db"
import { Minus, Plus } from "lucide-react"

export function MenuItemCard({ product }: { product: Product }) {
  const { items, addItem, setQuantity } = useCart()
  const { toast } = useToast()
  const price = product.price

  const cartItem = items.find((item) => item.productId === product.id)

  return (
    <Card className="overflow-hidden">
      <img src={product.imageData || "/placeholder.svg"} alt={product.name} className="h-48 w-full object-cover" />
      <CardHeader className="pb-2">
        <CardTitle className="text-pretty">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="line-clamp-3">{product.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="font-medium">Rp{price}</div>
        {cartItem ? (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                setQuantity(product.id, cartItem.quantity - 1)
              }}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                setQuantity(product.id, cartItem.quantity + 1)
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => {
              addItem(
                {
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  imageData: product.imageData,
                },
                1,
              )
            }}
          >
            Add to cart
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
