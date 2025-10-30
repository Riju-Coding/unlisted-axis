import { Suspense } from "react"
import type { Metadata } from "next"
import NewsPage from "@/components/news/news-page"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Market News - Latest Financial Updates | StockFlow",
  description:
    "Stay updated with the latest market news, financial updates, and breaking stories from Indian stock markets.",
  keywords: "market news, financial news, stock market updates, business news",
}

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50" />}>
        <NewsPage />
      </Suspense>
    </ThemeProvider>
  )
}
