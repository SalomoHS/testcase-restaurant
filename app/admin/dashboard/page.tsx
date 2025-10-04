import { isAdminFromCookies } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminProductForm } from "@/components/admin/product-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { listProducts } from "@/lib/mock-db"

export default async function AdminDashboardPage() {
  if (!isAdminFromCookies()) {
    redirect("/admin/login")
  }
  const products = await listProducts()

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Add New Product</h2>
        <div className="mx-auto max-w-3xl">
          <AdminProductForm />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Current Menu</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-md border p-3">
              <img src={p.imageData || "/placeholder.svg"} alt={p.name} className="h-32 w-full object-cover rounded" />
              <div className="mt-2 font-medium">{p.name}</div>
              <div className="text-sm text-muted-foreground">Rp{p.price}</div>
              <div className="text-xs text-muted-foreground">{p.category}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
