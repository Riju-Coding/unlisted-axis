import { Suspense } from "react"
import type { Metadata } from "next"
import PortfolioPage from "@/components/portfolio/portfolio-page"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Portfolio Management - Track Your Investments | StockFlow",
  description:
    "Manage your investment portfolio with advanced analytics, performance tracking, and risk assessment tools.",
  keywords: "portfolio management, investment tracking, portfolio analytics, stock portfolio",
}

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50" />}>
        <PortfolioPage />
      </Suspense>
    </ThemeProvider>
  )
}
