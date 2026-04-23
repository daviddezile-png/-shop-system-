"use client"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-800 to-purple-800"
    >
      {theme === "light" ? <Sun/>:<Moon/>}
      
    </Button>
  )
}
