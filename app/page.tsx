import { Suspense } from "react"
import type { Metadata } from "next"
import HomePage from "@/components/home/home-page"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Unlisted Axis - Trade Smarter, Invest Better | India's #1 Trading Platform",
  description:
    "Experience the future of stock trading with real-time NSE/BSE data, advanced analytics, and zero-commission trades in Indian markets.",
  keywords: "stock trading, NSE, BSE, Indian stock market, trading platform, investment",
  openGraph: {
    title: "Unlisted Axis - India's #1 Trading Platform",
    description: "Trade smarter with real-time market data and zero-commission trades",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StockFlow - Trade Smarter, Invest Better",
    description: "India's premier stock trading platform with real-time NSE/BSE data",
  },
}

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50" />}>
        <HomePage />
      </Suspense>
    </ThemeProvider>
  )
}
