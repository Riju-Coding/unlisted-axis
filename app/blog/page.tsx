import { Suspense } from "react"
import type { Metadata } from "next"
import BlogListingPage from "@/components/blog/blog-listing-page"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Investment Blog - Market Insights & Analysis | StockFlow",
  description:
    "Stay updated with latest market insights, investment strategies, stock analysis, and financial news from our expert team.",
  keywords: "investment blog, stock market analysis, financial insights, market news, investment strategies",
}

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50" />}>
        <BlogListingPage />
      </Suspense>
    </ThemeProvider>
  )
}
