'use client'
import { SidebarProvider } from "@/components/ui/sidebar"
import { SessionProvider } from "next-auth/react"

export function Providers({ children, defaultSidebarState }: { children: React.ReactNode, defaultSidebarState: boolean }) {
  return (
    <SessionProvider>
      <SidebarProvider defaultOpen={defaultSidebarState}>
        {children}
      </SidebarProvider>
    </SessionProvider>
  )
}