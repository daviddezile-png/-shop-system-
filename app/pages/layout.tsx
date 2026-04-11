import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Providers } from '../providers'
import SessionGuard from "@/components/SessionGuard"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
   
        <Providers defaultSidebarState={defaultOpen}>
          <SessionGuard>
          <AppSidebar />
          <main className="w-full p-2 ">
            <SidebarTrigger />
            {children}
          </main>
          </SessionGuard>
        </Providers>
  )
}
