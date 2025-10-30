import { Suspense } from "react"
import type { Metadata } from "next"
import ResearchPage from "@/components/research/research-page"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Research & Analysis - Market Insights | StockFlow",
  description:
    "Access comprehensive market research, stock analysis, and expert insights to make informed investment decisions.",
  keywords: "stock research, market analysis, investment insights, financial research",
}

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50" />}>
        <ResearchPage />
      </Suspense>
    </ThemeProvider>
  )
}
