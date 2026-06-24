"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const NAV = [
  { href: "/pipeline", label: "Pipeline", icon: "⬡" },
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside
      className="flex flex-col w-52 shrink-0 h-full"
      style={{ background: "var(--bg-subtle)", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          P
        </div>
        <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
          Pipeline allu
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors"
              style={{
                color: active ? "var(--text)" : "var(--text-muted)",
                background: active ? "var(--bg-hover)" : "transparent",
              }}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-2" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="px-2.5 py-1.5 rounded-md">
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors mt-0.5"
          style={{ color: "var(--text-faint)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
