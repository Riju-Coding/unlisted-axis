"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { SidebarToggleProvider } from "@/context/sidebar-toggle-context"
import { CustomSidebar } from "@/components/custom-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/context/auth-context"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  const isLoginPage = pathname === "/login"
  const isIndexPage = pathname === "/"

  // Don't show sidebar/header during initial loading or on login/index pages
  const shouldShowSidebar = !loading && !isLoginPage && !isIndexPage && user
  const shouldShowHeader = !loading && !isLoginPage && !isIndexPage && user

  return (
    <SidebarToggleProvider>
      <div className="flex min-h-screen">
        {shouldShowSidebar && <CustomSidebar />}
        <div
          className={`flex flex-1 flex-col ${shouldShowSidebar ? "md:ml-16 md:group-[.is-sidebar-open]:ml-64" : ""}`}
        >
          {shouldShowHeader && <DashboardHeader />}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarToggleProvider>
  )
}
