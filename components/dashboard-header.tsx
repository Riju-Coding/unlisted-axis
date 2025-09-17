"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { useSidebarToggle } from "@/context/sidebar-toggle-context"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { capitalize } from "@/lib/utils" // Assuming you have a utility for capitalizing

export function DashboardHeader() {
  const { toggleSidebar } = useSidebarToggle()
  const pathname = usePathname()

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter((segment) => segment !== "")
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/")
    const isLast = index === pathSegments.length - 1
    return {
      label: capitalize(segment.replace(/-/g, " ")), // Capitalize and replace hyphens
      href,
      isLast,
    }
  })

  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 bg-background">
      <Button variant="ghost" size="icon" className="mr-4" onClick={toggleSidebar}>
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!crumb.isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
