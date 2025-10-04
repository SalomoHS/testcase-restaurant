"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

function autoGenerateFromFile(file?: File) {
  // Simplified "AI" extraction: derive name from filename and randomize price
  const base = file?.name?.split(".")?.[0]?.replace(/[-_]/g, " ") || "Chef Special"
  const templates = [
    "A delightful selection prepared fresh daily.",
    "House favorite crafted with care.",
    "Simple, wholesome, and delicious.",
    "Comfort classic with a modern twist.",
  ]
  const desc = templates[Math.floor(Math.random() * templates.length)]
  const price = Math.floor(599 + Math.random() * 2000) // 5.99 to 25.99 in cents
  return {
    name: base
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase()),
    description: desc,
    price,
  }
}

export function AdminProductForm() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number>(1299)
  const [category, setCategory] = useState<"food" | "drink" | "none">("food")
  const [submitting, setSubmitting] = useState(false)
  const [confirmPending, setConfirmPending] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [nameDirty, setNameDirty] = useState(false)
  const [descriptionDirty, setDescriptionDirty] = useState(false)
  const [priceDirty, setPriceDirty] = useState(false)
  const [categoryDirty, setCategoryDirty] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setConfirmPending(true)
    setNameDirty(false)
    setDescriptionDirty(false)
    setPriceDirty(false)
    setCategoryDirty(false)
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(f)
    // auto-generate upon upload
    const gen = autoGenerateFromFile(f)
    setName("")
    setDescription("")
    setPrice(0)
    setCategory("none")
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const imagename = file?.name ?? ""
      try {
        await fetch("https://salomohs.app.n8n.cloud/webhook/dc6538ee-abeb-4fc6-bdfb-b605fca68183", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            price,
            category,
            imagename,
          }),
        })
      } catch (err) {
        console.error("[v0] Webhook submit error:", (err as Error).message)
      }

      let imageData = preview
      if (!imageData && file) {
        imageData = await new Promise<string>((resolve, reject) => {
          const r = new FileReader()
          r.onload = () => resolve(r.result as string)
          r.onerror = () => reject(new Error("file read error"))
          r.readAsDataURL(file)
        })
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          category,
          imageData: imageData || "/menu-item.jpg",
        }),
      })

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Save failed",
          description: "Could not save product.",
        })
        onCancelImage()
        return
      }

      toast({
        title: "Product saved",
        description: `${name} added to menu.`,
      })
      router.refresh()
      onCancelImage()
    } catch (err) {
      console.error("[v0] Save product error:", (err as Error).message)
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "An unexpected error occurred.",
      })
      onCancelImage()
    } finally {
      setSubmitting(false)
    }
  }

  async function sendImageToWebhook(f: File) {
    const fd = new FormData()
    fd.append("image", f, f.name)
    fd.append("filename", f.name)
    fd.append("mimeType", f.type || "application/octet-stream")
    try {
      const res = await fetch("https://salomohs.app.n8n.cloud/webhook/1cf4eabf-0854-48fb-8ce1-a41b1610c518", {
        method: "POST",
        body: fd,
      })
      if (!res.ok) {
        throw new Error(`Webhook responded with ${res.status}`)
      }
      const data = await res.json().catch(() => null)
      return data as {
        product_name?: string
        description?: string
        estimated_price?: number | string
        category?: string
      } | null
    } catch (err) {
      console.error("[v0] Image webhook error:", (err as Error).message)
      return null
    }
  }

  async function onConfirmImage() {
    if (!file) return
    setConfirmLoading(true)
    try {
      const data = await sendImageToWebhook(file)
      if (data) {
        if (!nameDirty && typeof data.product_name === "string" && data.product_name.trim()) {
          setName(data.product_name.trim())
        }
        if (!descriptionDirty && typeof data.description === "string" && data.description.trim()) {
          setDescription(data.description.trim())
        }

        if (!priceDirty) {
          const ep = (data as any).estimated_price
          if (ep === "-" || (typeof ep === "string" && ep.trim() === "-")) {
            setPrice(0)
          } else {
            const parsed = typeof ep === "string" ? Number(ep) : typeof ep === "number" ? ep : Number.NaN
            if (!Number.isNaN(parsed)) {
              const cents = parsed < 1000 ? Math.round(parsed * 100) : Math.round(parsed)
              setPrice(cents)
            }
          }
        }

        if (!categoryDirty) {
          const rawCat = (data as any).category
          if (typeof rawCat === "string") {
            const cat = rawCat.trim().toLowerCase()
            if (cat === "-") {
              setCategory("none")
            } else if (cat === "food" || cat === "drink") {
              setCategory(cat as "food" | "drink" | "none")
            }
          }
        }
      }
    } catch (err) {
      console.error("[v0] Confirm image parse error:", (err as Error).message)
    } finally {
      setConfirmLoading(false)
      setConfirmPending(false)
    }
  }

  function onCancelImage() {
    setFile(null)
    setPreview(null)
    setConfirmPending(false)
    setName("")
    setDescription("")
    setPrice(0)
    setCategory("none")
    setNameDirty(false)
    setDescriptionDirty(false)
    setPriceDirty(false)
    setCategoryDirty(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className={cn("grid gap-4",file ? "md:grid-cols-2 md:justify-items-start" : "justify-items-center")}>
        <div className="space-y-2 mx-auto max-w-sm text-center">
          <Label htmlFor="photo" className="block">Product photo</Label>
          <Input id="photo" type="file" accept="image/*" onChange={onFileChange} required ref={fileInputRef} />
          {!file && (
            <p className="text-sm text-muted-foreground">
              Choose a photo to continue. We’ll auto-fill the details for you.
            </p>
          )}
          {preview && (
            <>
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="mt-2 h-48 w-full rounded-md object-cover border"
              />
              {file && confirmPending && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Button type="button" variant="secondary" onClick={onCancelImage}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={onConfirmImage} disabled={confirmLoading}>
                    {confirmLoading ? "Confirming..." : "Confirm image"}
                  </Button>
                </div>
              )}
              {file && !confirmPending && (
                <div className="mt-2 flex items-center justify-center">
                  <Button type="button" variant="secondary" onClick={onCancelImage}>
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        {file && (
          <div className="space-y-3">
            {confirmPending && (
              <p className="text-sm text-muted-foreground">We’re analyzing your image. You can start editing now.</p>
            )}
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameDirty(true)
                }}
                disabled={confirmLoading || confirmPending}
                className={cn(
                  confirmLoading || confirmPending ? "bg-gray-100 text-gray-400" : ""
                )}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setDescriptionDirty(true)
                }}
                disabled={confirmLoading || confirmPending}
                className={cn(
                  confirmLoading || confirmPending ? "bg-gray-100 text-gray-400" : ""
                )}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price">Price (Rupiah)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="1"
                value={price}
                onChange={(e) => {
                  setPrice(Math.round(Number(e.target.value || 0)))
                  setPriceDirty(true)
                }}
                disabled={confirmLoading || confirmPending}
                className={cn(
                  confirmLoading || confirmPending ? "bg-gray-100 text-gray-400" : ""
                )}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v as "food" | "drink" | "none")
                  setCategoryDirty(true)
                }}
                disabled={confirmLoading || confirmPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="drink">Drink</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
      {file && (
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={submitting || !file || confirmPending || confirmLoading || category === "none"}>
            {submitting ? "Saving..." : "Save product"}
          </Button>
        </div>
      )}
    </form>
  )
}
