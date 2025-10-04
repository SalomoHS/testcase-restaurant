"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/cart"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/mock-db"

export function MenuItemCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const price = (product.price)

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
            toast({
              title: "Added to cart",
              description: `${product.name} added to your cart.`,
            })
          }}
        >
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  )
}
