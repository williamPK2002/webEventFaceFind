"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Camera, ChevronDown, User, Mail, LogOut, Settings } from "lucide-react"
import { Navigation } from "./navigation"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface HeaderProps {
  showLogout?: boolean
  userRole?: "student" | "photographer" | "admin"
}

export function Header({ showLogout = false, userRole = "student" }: HeaderProps) {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    if (userRole === "admin") {
      const storedName = localStorage.getItem("admin_name")
      const storedEmail = "admin@university.edu" // Default or from storage if you add it
      if (storedName) setUserName(storedName)
      setUserEmail(storedEmail)
    } else {
      const storedName = localStorage.getItem("user_name")
      const storedEmail = localStorage.getItem("user_email") || "student@mfu.ac.th"
      if (storedName) setUserName(storedName)
      setUserEmail(storedEmail)
    }
  }, [userRole])

  const handleLogout = () => {
    if (userRole === "admin") {
      localStorage.removeItem("admin_token")
      localStorage.removeItem("admin_name")
      router.push("/")
    } else {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_name")
      localStorage.removeItem("university_id")
      localStorage.removeItem("user_email")
      router.push("/")
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <Camera className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Photo Finder</span>
          </div>
          <Navigation userRole={userRole} />
        </div>

        {userName && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-auto py-2 px-3 hover:bg-primary/10">
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">{userName}</div>
                  <div className="text-xs text-muted-foreground">{userEmail}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start gap-2 py-2 hover:bg-primary/10 focus:bg-primary/10 hover:text-foreground focus:text-foreground">
                <User className="w-4 h-4 mt-0.5" />
                <div>
                  <div className="font-medium">{userName}</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-primary/10 focus:bg-primary/10 hover:text-foreground focus:text-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{userEmail}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="hover:bg-primary/10 focus:bg-primary/10 hover:text-foreground focus:text-foreground"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
