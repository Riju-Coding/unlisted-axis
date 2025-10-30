import { Suspense } from "react"
import type { Metadata } from "next"
import WatchlistPage from "@/components/watchlist/watchlist-page"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Watchlist - Track Your Favorite Stocks | StockFlow",
  description: "Create and manage your stock watchlist with real-time price alerts and performance tracking.",
  keywords: "stock watchlist, price alerts, stock tracking, investment monitoring",
}

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50" />}>
        <WatchlistPage />
      </Suspense>
    </ThemeProvider>
  )
}
