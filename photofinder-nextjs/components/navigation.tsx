"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Upload, Users, BarChart3, ImageIcon } from "lucide-react"

interface NavigationProps {
  userRole?: "student" | "photographer" | "admin"
}

export function Navigation({ userRole = "student" }: NavigationProps) {
  const pathname = usePathname()

  const getNavItems = () => {
    const baseItems = [
      { href: "/browse", label: "Browse Photos", icon: ImageIcon },
      { href: "/dashboard", label: "My Photos", icon: Users },
    ]

    if (userRole === "photographer") {
      return [{ href: "/photographer", label: "Upload Photos", icon: Upload }, ...baseItems]
    }

    if (userRole === "admin") {
      return [
        { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/admin/events/create", label: "Create Event", icon: Upload },
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10",
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
