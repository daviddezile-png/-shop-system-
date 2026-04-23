"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export function Providers({
  children,
  defaultSidebarState,
}: {
  children: React.ReactNode;
  defaultSidebarState: boolean;
}) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SidebarProvider defaultOpen={defaultSidebarState}>
          {children}
        </SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
