import { Suspense } from "react"
import type { Metadata } from "next"
import MarketsPage from "@/components/markets/markets-page"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Live Markets - Real-time NSE/BSE Data | StockFlow",
  description:
    "Track live stock prices, market indices, and trading volumes with real-time NSE and BSE data on StockFlow.",
  keywords: "live markets, NSE, BSE, stock prices, market data, real-time trading",
}

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50" />}>
        <MarketsPage />
      </Suspense>
    </ThemeProvider>
  )
}
