import { cookies } from "next/headers"

const ADMIN_COOKIE = "demo_admin"

export function isAdminFromCookies(): boolean {
  const c = cookies().get(ADMIN_COOKIE)
  return c?.value === "1"
}

export function getAdminCookieName() {
  return ADMIN_COOKIE
}
