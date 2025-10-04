"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check if already logged in on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/me")
        if (res.ok) {
          router.push("/admin/dashboard")
          return
        }
      } catch (e) {
        // not logged in → show login form
      } finally {
        setChecking(false)
      }
    }
    checkAuth()
  }, [router])

  async function onSubmit(e: React.FormEvent) {
    console.log("CLICK LOGIN")
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      console.log(res)
      if (!res.ok) throw new Error("Invalid credentials")
      // redirect immediately after successful login
      await new Promise((resolve) => setTimeout(resolve, 100))
      
      window.location.href = "/admin/dashboard"
    } catch (e) {
      alert("Login failed")
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="mx-auto max-w-sm p-6">
        <div className="text-center">Checking authentication...</div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Login</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Demo credentials: <code>admin / admin</code>
        </p>
      </form>
    </main>
  )
}
