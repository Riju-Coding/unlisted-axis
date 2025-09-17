"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface SidebarToggleContextType {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

const SidebarToggleContext = createContext<SidebarToggleContextType | undefined>(undefined)

export const SidebarToggleProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true) // Default to open on desktop

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  return (
    <SidebarToggleContext.Provider value={{ isSidebarOpen, toggleSidebar, setSidebarOpen }}>
      {children}
    </SidebarToggleContext.Provider>
  )
}

export const useSidebarToggle = () => {
  const context = useContext(SidebarToggleContext)
  if (context === undefined) {
    throw new Error("useSidebarToggle must be used within a SidebarToggleProvider")
  }
  return context
}
