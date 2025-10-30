import { Suspense } from "react"
import type { Metadata } from "next"
import IPOsPage from "@/components/ipos/ipos-page"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "IPO Listings - Latest IPO Updates & Analysis | StockFlow",
  description: "Track latest IPO listings, subscription status, GMP, allotment dates, and comprehensive IPO analysis.",
  keywords: "IPO listings, initial public offering, IPO subscription, GMP, IPO allotment, IPO analysis",
}

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50" />}>
        <IPOsPage />
      </Suspense>
    </ThemeProvider>
  )
}
