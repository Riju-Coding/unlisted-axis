"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, List, Settings, LogOut, Users, ChevronDown, User2, ChevronUp, X, FileText } from "lucide-react"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useAuth } from "@/context/auth-context"
import { useSidebarToggle } from "@/context/sidebar-toggle-context"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

export function CustomSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, loading } = useAuth()
  const { isSidebarOpen, setSidebarOpen } = useSidebarToggle()
  const isMobile = useIsMobile()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const adminItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Manage Shares", url: "/dashboard/shares", icon: List },
    { title: "Blog Management", url: "/dashboard/blog", icon: FileText },
    { title: "Enquiry Management", url: "/dashboard/enquiries", icon: FileText },
     { title: "IPO Management", url: "/dashboard/ipo", icon: FileText },
    { title: "Manage Users", url: "/dashboard/users", icon: Users },
  ]

  const userItems = [{ title: "Dashboard", url: "/dashboard", icon: Home }]

  const commonItems = [{ title: "Settings", url: "/dashboard/settings", icon: Settings }]

  // Role-based menu items - settings only for admins
  const getMenuItems = () => {
    if (role === "admin") {
      return [...adminItems, ...commonItems]
    } else if (role === "user") {
      return userItems // No settings for regular users
    }
    return [{ title: "Dashboard", url: "/dashboard", icon: Home }] // Fallback
  }

  const menuItems = getMenuItems()

  const sidebarContent = (
    <div className="flex h-full flex-col bg-gray-800 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-lg font-semibold text-white hover:bg-gray-700 hover:text-white"
            >
              Unlisted Axis
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)] bg-gray-700 text-white border-gray-600">
            <DropdownMenuItem
              className="hover:bg-gray-600"
              onClick={() => {
                /* navigate to main app */
              }}
            >
              <span>Main App</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-600"
              onClick={() => {
                /* navigate to admin panel */
              }}
            >
              <span>Admin Panel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>

      {/* Navigation Content */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Navigation</h3>
        <ul className="space-y-1">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <li key={index} className="h-8 bg-gray-700 rounded-md animate-pulse"></li>
              ))
            : menuItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.url}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-700 hover:text-white",
                      pathname === item.url ? "bg-gray-700 text-white" : "text-gray-300",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
        </ul>

        {/* Role Badge */}
        {role && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 px-3 py-2 text-xs">
              <span className="text-gray-400">Role:</span>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  role === "admin" ? "bg-blue-600 text-white" : "bg-green-600 text-white",
                )}
              >
                {role.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-sm font-medium text-white hover:bg-gray-700 hover:text-white"
            >
              <User2 className="mr-2 h-4 w-4" /> {user?.email || "Profile"}
              <ChevronUp className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[var(--radix-popper-anchor-width)] bg-gray-700 text-white border-gray-600"
          >
            {/* Only show settings in dropdown for admins */}
            {role === "admin" && (
              <DropdownMenuItem
                className="hover:bg-gray-600"
                onClick={() => {
                  router.push("/dashboard/settings")
                  isMobile && setSidebarOpen(false)
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="hover:bg-gray-600" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[18rem] bg-transparent border-none">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-0 -translate-x-full md:w-16 md:translate-x-0",
        "md:relative md:flex",
      )}
    >
      {sidebarContent}
    </aside>
  )
}
